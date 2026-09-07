import { Router } from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getMovements
} from '../controllers/productController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'
import { optionalAuth } from '../middleware/optionalAuth.js'

const router = Router()

// Catálogo público, pero con formato distinto si hay un admin logueado
router.get('/', optionalAuth, getProducts)
router.get('/movements', protect, authorize('admin'), getMovements)
router.get('/:id', optionalAuth, getProductById)

// Solo admin gestiona productos
router.post('/', protect, authorize('admin'), createProduct)
router.put('/:id', protect, authorize('admin'), updateProduct)
router.delete('/:id', protect, authorize('admin'), deleteProduct)
router.patch('/:id/stock', protect, authorize('admin'), adjustStock)

export default router
