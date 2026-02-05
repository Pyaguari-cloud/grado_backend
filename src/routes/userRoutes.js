import express from 'express'
import { getUsers, createTeacher, updateUser, deleteUser } from '../controllers/userController.js'
import { protect, authorize } from '../middleware/authentication.js'
// o si creaste admin: import { protect, admin } from '../middleware/authentication.js'

const router = express.Router()

// Listar todos los usuarios (solo admin)
router.get('/', protect, authorize('admin'), getUsers)
// si usas admin helper:
// router.get('/', protect, admin, getUsers)

// Crear docente (solo admin)
router.post('/teachers', protect, authorize('admin'), createTeacher)
// o: router.post('/teachers', protect, admin, createTeacher)


// Editar usuario (solo admin)
router.put('/:id', protect, authorize('admin'), updateUser)

// Eliminar usuario (solo admin)
router.delete('/:id', protect, authorize('admin'), deleteUser)

export default router