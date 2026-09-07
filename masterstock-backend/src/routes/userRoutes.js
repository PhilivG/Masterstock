import { Router } from 'express'
import { updateMyProfile, getUsers } from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/authorize.js'

const router = Router()

router.use(protect)

router.put('/me', updateMyProfile)
router.get('/', authorize('admin'), getUsers)

export default router
