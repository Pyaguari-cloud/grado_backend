import express from 'express'
import { 
  register, 
  login, 
  getMe, 
  updateProfile,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'
import { protect } from '../middleware/authentication.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/verify-email', verifyEmail)
router.post('/resend-code', resendVerificationCode)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Protected routes
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)

export default router