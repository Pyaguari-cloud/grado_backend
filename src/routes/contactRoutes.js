import express from 'express'
import {
  createContact,
  getContacts,
  updateContact
} from '../controllers/contactController.js'
import { protect, authorize } from '../middleware/authentication.js'

const router = express.Router()

// Public route
router.post('/', createContact)

// Protected routes - Admin only
router.get('/', protect, authorize('admin'), getContacts)
router.put('/:id', protect, authorize('admin'), updateContact)

export default router