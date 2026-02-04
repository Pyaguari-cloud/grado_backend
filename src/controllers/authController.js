import User from '../models/userModel.js'
import generateToken from '../utils/jwt.js'
import sendEmail from '../utils/sendEmail.js'

// Helper: código de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// @desc    Register new user (send verification code)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const verificationCode = generateCode()
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    let user
    if (existingUser) {
      existingUser.name = name || existingUser.name
      existingUser.password = password || existingUser.password
      existingUser.phone = phone || existingUser.phone
      existingUser.role = role || existingUser.role
      existingUser.verificationCode = verificationCode
      existingUser.verificationCodeExpires = verificationCodeExpires
      existingUser.isVerified = false
      user = await existingUser.save()
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'student',
        isVerified: false,
        verificationCode,
        verificationCodeExpires
      })
    }

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    await sendEmail({
      to: email,
      subject: 'Verifica tu cuenta - Premium School',
      html: `
        <h1>Verificación de cuenta</h1>
        <p>Hola ${user.name},</p>
        <p>Tu código de verificación es:</p>
        <h2>${verificationCode}</h2>
        <p>Este código expira en 15 minutos.</p>
        <p>También puedes hacer clic en este enlace:</p>
        <p><a href="${frontendUrl}/verify-email?email=${encodeURIComponent(email)}">Verificar cuenta</a></p>
        <p>Si no creaste esta cuenta, ignora este mensaje.</p>
      `
    })

    return res.status(201).json({
      success: true,
      message: 'User registered. Verification code sent to email.',
      data: { email: user.email }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      })
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      })
    }

    user.isVerified = true
    user.verificationCode = undefined
    user.verificationCodeExpires = undefined
    await user.save()

    const token = generateToken(user._id)

    return res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token
      }
    })
  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User already verified'
      })
    }

    const verificationCode = generateCode()
    user.verificationCode = verificationCode
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    await sendEmail({
      to: email,
      subject: 'Nuevo código de verificación - Premium School',
      html: `
        <h1>Nuevo código de verificación</h1>
        <p>Hola ${user.name},</p>
        <p>Tu nuevo código de verificación es:</p>
        <h2>${verificationCode}</h2>
        <p>Este código expira en 15 minutos.</p>
        <p><a href="${frontendUrl}/verify-email?email=${encodeURIComponent(email)}">Verificar cuenta</a></p>
      `
    })

    return res.json({
      success: true,
      message: 'Verification code resent to email'
    })
  } catch (error) {
    console.error('Resend code error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Login user (only verified)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please check your inbox.',
        code: 'EMAIL_NOT_VERIFIED'
      })
    }

    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Forgot password - send reset code
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    // No revelamos si existe o no
    if (!user) {
      return res.json({
        success: true,
        message: 'If that email exists, a reset code was sent.'
      })
    }

    const resetCode = generateCode()
    user.resetPasswordToken = resetCode
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    await sendEmail({
      to: email,
      subject: 'Restablecer contraseña - Premium School',
      html: `
        <h1>Restablecer contraseña</h1>
        <p>Hola ${user.name},</p>
        <p>Tu código para restablecer la contraseña es:</p>
        <h2>${resetCode}</h2>
        <p>Este código expira en 15 minutos.</p>
        <p><a href="${frontendUrl}/reset-password?email=${encodeURIComponent(email)}">Cambiar contraseña</a></p>
      `
    })

    return res.json({
      success: true,
      message: 'If that email exists, a reset code was sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      })
    }

    if (
      !user.resetPasswordToken ||
      user.resetPasswordToken !== code ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      })
    }

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses')

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.phone = req.body.phone || user.phone

      if (req.body.password) {
        user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          token: generateToken(updatedUser._id)
        }
      })
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}