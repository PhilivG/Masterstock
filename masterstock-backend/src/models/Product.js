import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    // Categoría y marca como campos simples (no colecciones separadas) para el alcance recortado
    category: { type: String, required: true, trim: true }, // ej. GPU, CPU, RAM, Motherboard
    brand: { type: String, trim: true }, // ej. NVIDIA, AMD, Corsair
    specs: { type: Object }, // objeto libre: { socket: 'AM5', vram: '16GB' }
    images: [{ type: String }],
    status: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
