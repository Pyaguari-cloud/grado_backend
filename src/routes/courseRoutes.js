import express from 'express'
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js'
import { protect, authorize } from '../middleware/authentication.js'

const router = express.Router()

// Public routes
router.get('/', getCourses)
router.get('/:id', getCourse)

// Protected routes - Admin/Teacher only
router.post('/', protect, authorize('admin', 'teacher'), createCourse)
router.put('/:id', protect, authorize('admin', 'teacher'), updateCourse)
router.delete('/:id', protect, authorize('admin'), deleteCourse)

export default router