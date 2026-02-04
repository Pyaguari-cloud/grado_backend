import express from 'express'
import {
  createEnrollment,
  getMyEnrollments,
  getEnrollments,
  updateEnrollment
} from '../controllers/enrollmentController.js'
import { protect, authorize } from '../middleware/authentication.js'

const router = express.Router()

// Protected routes - Student
router.post('/', protect, createEnrollment)
router.get('/my-enrollments', protect, getMyEnrollments)

// Protected routes - Admin
router.get('/', protect, authorize('admin', 'teacher'), getEnrollments)
router.put('/:id', protect, authorize('admin', 'teacher'), updateEnrollment)

export default router