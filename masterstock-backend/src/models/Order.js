import mongoose from 'mongoose'

// Cada item guarda el precio al momento de la compra (no referencia el precio actual del producto)
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  },
  { _id: false }
)

// Envios solo dentro de Colombia por ahora (alcance recortado del proyecto)
const shippingAddressSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    notes: { type: String, trim: true }
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    // Sin aprobacion manual: el pedido nace "confirmado" (ya se validó y descontó
    // stock al crearlo) y avanza por el envio. "cancelado" puede pasar antes de
    // entregarlo. shippedAt/deliveredAt/cancelledAt quedan null hasta que ocurren.
    status: {
      type: String,
      enum: ['confirmado', 'enviado', 'entregado', 'cancelado'],
      default: 'confirmado'
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    // Incidente post-venta: independiente del status de envio (ej. se puede
    // ofrecer reembolso sobre un pedido ya "entregado").
    resolution: { type: String, enum: ['reembolso', 'reemplazo', null], default: null },
    resolutionNote: { type: String, trim: true },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
