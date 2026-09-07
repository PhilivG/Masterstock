import mongoose from 'mongoose'

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['entrada', 'salida'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true }, // ej. "compra a proveedor"
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // quién generó el movimiento
  },
  { timestamps: true }
)

export default mongoose.model('InventoryMovement', inventoryMovementSchema)
