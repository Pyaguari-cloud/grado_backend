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

// PUT /api/users/:id  (solo admin) - editar usuario
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, role, phone, isVerified } = req.body

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
        }

        // Evitar que un admin se borre su propio rol admin sin querer (opcional)
        if (user.role === 'admin' && role && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'No puedes cambiar el rol de otro administrador desde aquí',
            })
        }

        if (name !== undefined) user.name = name
        if (email !== undefined) user.email = email
        if (role !== undefined) user.role = role
        if (phone !== undefined) user.phone = phone
        if (isVerified !== undefined) user.isVerified = isVerified

        const updated = await user.save()

        res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: {
                _id: updated._id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                phone: updated.phone,
                isVerified: updated.isVerified,
            },
        })
    } catch (error) {
        console.error('Update user error:', error)
        res.status(500).json({ success: false, message: 'Error al actualizar usuario' })
    }
}

// DELETE /api/users/:id  (solo admin) - eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        // Evitar que un admin se elimine a sí mismo (opcional)
        if (req.user._id.toString() === id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'No puedes eliminar tu propia cuenta desde aquí',
            })
        }

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
        }

        await user.deleteOne()

        res.json({ success: true, message: 'Usuario eliminado correctamente' })
    } catch (error) {
        console.error('Delete user error:', error)
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' })
    }
}