import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { toErrorResponse } from '../utils/errorResponse.js'
import { isNonEmptyString } from '../utils/validators.js'

function generateToken (user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )
}

export async function register (req, res) {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' })
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role === 'admin' ? 'comprador' : role
    })

    const token = generateToken(user)
    res.status(201).json({ user, token })
  } catch (error) {
    const { status, message } = toErrorResponse(error)
    res.status(status).json({ message })
  }
}

export async function login (req, res) {
  try {
    const { email, password } = req.body

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = generateToken(user)
    res.json({ user, token })
  } catch (error) {
    const { status, message } = toErrorResponse(error)
    res.status(status).json({ message })
  }
}

export async function me (req, res) {
  res.json(req.user)
}
