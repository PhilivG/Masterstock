import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Para rutas públicas (como el catálogo) que igual necesitan saber el rol SI el usuario está logueado.
// A diferencia de `protect`, nunca responde 401: si no hay token o es inválido, sigue como visitante.
export async function optionalAuth (req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (user) req.user = user
  } catch (error) {
    // Token inválido en una ruta pública: simplemente se ignora, no se bloquea la petición
  }

  next()
}
