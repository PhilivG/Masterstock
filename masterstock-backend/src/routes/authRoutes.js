import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, me } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Limita intentos de login/registro para mitigar fuerza bruta y credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, intenta de nuevo en unos minutos' }
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', protect, me)

export default router
