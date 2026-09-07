import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Verifica el token JWT y adjunta el usuario autenticado a req.user
export async function protect (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado, falta el token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}
