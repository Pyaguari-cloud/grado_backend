import User from '../models/userModel.js'

// GET /api/users  (solo admin) - listar usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
    })
  }
}

// POST /api/users/teachers  (solo admin) - crear docente
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son obligatorios',
      })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      })
    }

    const user = await User.create({
      name,
      email,
      password, // asumiendo que userModel hace hash en pre('save')
      phone,
      role: 'teacher',
      isVerified: true, // opcional: ya lo marcas como verificado
    })

    res.status(201).json({
      success: true,
      message: 'Docente creado correctamente',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Create teacher error:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear docente',
    })
  }
}