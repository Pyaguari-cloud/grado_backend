import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import enrollmentRoutes from './routes/enrollmentRoutes.js'

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize express app
const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logger middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
  })
}

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/enrollments', enrollmentRoutes)

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 Welcome to Premium School API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      courses: '/api/courses',
      contact: '/api/contact',
      enrollments: '/api/enrollments'
    },
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getProfile: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile'
      },
      courses: {
        getAll: 'GET /api/courses',
        getOne: 'GET /api/courses/:id',
        create: 'POST /api/courses (admin/teacher)',
        update: 'PUT /api/courses/:id (admin/teacher)',
        delete: 'DELETE /api/courses/:id (admin)'
      },
      contact: {
        send: 'POST /api/contact',
        getAll: 'GET /api/contact (admin)',
        update: 'PUT /api/contact/:id (admin)'
      },
      enrollments: {
        enroll: 'POST /api/enrollments',
        myEnrollments: 'GET /api/enrollments/my-enrollments',
        getAll: 'GET /api/enrollments (admin)',
        update: 'PUT /api/enrollments/:id (admin)'
      }
    }
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl
  })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  })
})

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50))
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`)
  console.log(`📍 Port: ${PORT}`)
  console.log(`🌐 API URL: http://localhost:${PORT}`)
  console.log(`🎓 Frontend URL: ${process.env.CLIENT_URL}`)
  console.log('='.repeat(50) + '\n')
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`)
  // Close server & exit process
  process.exit(1)
})