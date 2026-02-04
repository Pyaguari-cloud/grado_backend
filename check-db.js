import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/userModel.js'
import bcrypt from 'bcryptjs'

dotenv.config()

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Find admin user
    const admin = await User.findOne({ email: 'admin@school.com' }).select('+password')
    
    if (!admin) {
      console.log('❌ Admin user not found!')
      process.exit(1)
    }

    console.log('\n📋 Admin User Info:')
    console.log('Name:', admin.name)
    console.log('Email:', admin.email)
    console.log('Role:', admin.role)
    console.log('Password hash:', admin.password)
    console.log('Password hash length:', admin.password.length)
    console.log('Starts with $2a$ or $2b$:', admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'))

    // Test password manually
    console.log('\n🔐 Testing password:')
    const testPassword = 'admin123'
    const isMatch = await bcrypt.compare(testPassword, admin.password)
    console.log(`Password "${testPassword}" matches:`, isMatch)

    // Test with User model method
    const isMatchModel = await admin.matchPassword(testPassword)
    console.log('Password matches (using model method):', isMatchModel)

    process.exit()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkDB()