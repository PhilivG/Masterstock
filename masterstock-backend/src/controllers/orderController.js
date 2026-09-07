import Order from '../models/Order.js'
import Product from '../models/Product.js'
import InventoryMovement from '../models/InventoryMovement.js'
import { isPositiveInteger } from '../utils/validators.js'

// Envio gratis a partir de este subtotal; si no, tarifa plana. Se calcula en el
// servidor (nunca se confía en un shippingCost que mande el cliente).
const FREE_SHIPPING_THRESHOLD = 300000
const FLAT_SHIPPING_COST = 15000

const REQUIRED_ADDRESS_FIELDS = ['department', 'city', 'address', 'phone']

// Sin aprobacion manual: si hay stock para todo el pedido se confirma y se
// descuenta de una vez; si no alcanza para algun producto, no se deja crear.
export async function createOrder (req, res) {
  try {
    const { items, shippingAddress } = req.body // items: [{ productId, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El pedido debe tener al menos un producto' })
    }

    if (!shippingAddress || REQUIRED_ADDRESS_FIELDS.some((field) => !shippingAddress[field]?.trim())) {
      return res.status(400).json({ message: 'Falta completar la dirección de envío' })
    }

    const orderItems = []
    const products = []
    let subtotal = 0

    for (const item of items) {
      if (!isPositiveInteger(item.quantity)) {
        return res.status(400).json({ message: 'La cantidad de cada producto debe ser un entero positivo' })
      }

      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({ message: `Producto ${item.productId} no encontrado` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `No hay stock suficiente de ${product.name}` })
      }

      const itemSubtotal = product.price * item.quantity
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      })
      products.push({ product, quantity: item.quantity })
      subtotal += itemSubtotal
    }

    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      shippingAddress: {
        department: shippingAddress.department.trim(),
        city: shippingAddress.city.trim(),
        address: shippingAddress.address.trim(),
        phone: shippingAddress.phone.trim(),
        notes: shippingAddress.notes?.trim()
      },
      status: 'confirmado'
    })

    // Descuenta el stock ya, no queda pendiente de que un admin lo apruebe
    for (const { product, quantity } of products) {
      product.stock -= quantity
      await product.save()

      await InventoryMovement.create({
        product: product._id,
        type: 'salida',
        quantity,
        reason: `Pedido ${order._id} confirmado`,
        user: req.user._id
      })
    }

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message })
  }
}

// Admin ve todos los pedidos; comprador solo ve los suyos
export async function getOrders (req, res) {
  try {
    const filter = req.user.role === 'admin' ? {} : { buyer: req.user._id }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name sku images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter)
    ])

    res.json({ data: orders, page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message })
  }
}

export async function getOrderById (req, res) {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name sku images')
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' })

    const isOwner = order.buyer.toString() === req.user._id.toString()
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para ver este pedido' })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pedido', error: error.message })
  }
}

// Avanza el estado de envio: confirmado -> enviado -> entregado, o -> cancelado
// en cualquier punto antes de entregarlo. Si se cancela, el stock ya descontado
// al confirmar se devuelve al inventario.
export async function updateOrderStatus (req, res) {
  try {
    const { status } = req.body
    const validStatuses = ['confirmado', 'enviado', 'entregado', 'cancelado']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' })

    if (order.status === 'entregado' || order.status === 'cancelado') {
      return res.status(400).json({ message: `Este pedido ya está "${order.status}", no se puede cambiar su envío` })
    }

    if (status === 'cancelado') {
      for (const item of order.items) {
        const product = await Product.findById(item.product)
        if (!product) continue

        product.stock += item.quantity
        await product.save()

        await InventoryMovement.create({
          product: product._id,
          type: 'entrada',
          quantity: item.quantity,
          reason: `Pedido ${order._id} cancelado`,
          user: req.user._id
        })
      }
      order.cancelledAt = new Date()
    } else if (status === 'enviado') {
      order.shippedAt = new Date()
    } else if (status === 'entregado') {
      order.deliveredAt = new Date()
    }

    order.status = status
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el pedido', error: error.message })
  }
}

// Incidente post-venta (ej. el producto llegó dañado): independiente del status
// de envio, un pedido "entregado" tambien puede recibir un reembolso u ofrecerse
// un reemplazo. No mueve stock automáticamente -- eso lo maneja el admin aparte
// desde el panel de inventario si corresponde.
export async function setOrderResolution (req, res) {
  try {
    const { resolution, note } = req.body
    const validResolutions = ['reembolso', 'reemplazo']

    if (!validResolutions.includes(resolution)) {
      return res.status(400).json({ message: 'Resolución inválida' })
    }
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Escribe una nota explicando el incidente' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' })

    if (order.status === 'cancelado') {
      return res.status(400).json({ message: 'Este pedido está cancelado, no se le puede ofrecer reembolso o reemplazo' })
    }

    order.resolution = resolution
    order.resolutionNote = note.trim()
    order.resolvedAt = new Date()
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la resolución', error: error.message })
  }
}
