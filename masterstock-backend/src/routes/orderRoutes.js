import { Router } from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  setOrderResolution
} from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

router.use(protect) // todas las rutas de pedidos requieren estar logueado

router.post('/', authorize('comprador'), createOrder)
router.get('/', getOrders) // el controlador filtra según el rol
router.get('/:id', getOrderById) // el controlador valida que sea el dueño o admin
router.patch('/:id/status', authorize('admin'), updateOrderStatus)
router.patch('/:id/resolution', authorize('admin'), setOrderResolution)

export default router
