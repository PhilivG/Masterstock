import Product from '../models/Product.js'
import InventoryMovement from '../models/InventoryMovement.js'
import { isPositiveInteger } from '../utils/validators.js'

function formatProduct (product, role) {
  const obj = product.toObject ? product.toObject() : product

  if (role === 'admin') {
    return obj
  }

  const { stock, ...rest } = obj
  return { ...rest, disponible: stock > 0 }
}

export async function getProducts (req, res) {
  try {
    const { category } = req.query
    const filter = { status: 'activo' }
    if (category) filter.category = category

    const products = await Product.find(filter)
    const role = req.user?.role
    res.json(products.map((p) => formatProduct(p, role)))
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message })
  }
}

export async function getProductById (req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    res.json(formatProduct(product, req.user?.role))
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message })
  }
}

export async function createProduct (req, res) {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message })
  }
}

export async function updateProduct (req, res) {
  try {
    // No permitir cambiar el stock por esta ruta: eso solo pasa por /stock, para que quede el registro en InventoryMovement
    const { stock, ...updates } = req.body

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message })
  }
}

export async function deleteProduct (req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    res.json({ message: 'Producto eliminado' })
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message })
  }
}

export async function adjustStock (req, res) {
  try {
    const { type, quantity, reason } = req.body

    if (!['entrada', 'salida'].includes(type)) {
      return res.status(400).json({ message: 'El tipo debe ser "entrada" o "salida"' })
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({ message: 'La cantidad debe ser un entero positivo' })
    }

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' })

    if (type === 'salida' && product.stock < quantity) {
      return res.status(400).json({ message: 'No hay suficiente stock para esta salida' })
    }

    product.stock += type === 'entrada' ? quantity : -quantity
    await product.save()

    await InventoryMovement.create({
      product: product._id,
      type,
      quantity,
      reason,
      user: req.user._id
    })

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: 'Error al ajustar el stock', error: error.message })
  }
}

export async function getMovements (req, res) {
  try {
    const filter = {}
    if (req.query.productId) filter.product = req.query.productId

    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))

    const [movements, total] = await Promise.all([
      InventoryMovement.find(filter)
        .populate('product', 'name sku')
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      InventoryMovement.countDocuments(filter)
    ])

    res.json({ data: movements, page, limit, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos', error: error.message })
  }
}
