import User from '../models/User.js'

export async function updateMyProfile (req, res) {
  try {
    const { firstName, lastName, phone } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    )

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message })
  }
}

export async function getUsers (req, res) {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message })
  }
}
