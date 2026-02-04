import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/userModel.js'
import Course from '../models/CourseModel.js'
import connectDB from '../config/db.js'

dotenv.config()

connectDB()

const users = [
  {
    name: 'Admin User',
    email: 'admin@school.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1234567890'
  },
  {
    name: 'Dr. Carlos Méndez',
    email: 'carlos@school.com',
    password: 'teacher123',
    role: 'teacher',
    phone: '+1234567891'
  },
  {
    name: 'Dra. Ana Rodríguez',
    email: 'ana@school.com',
    password: 'teacher123',
    role: 'teacher',
    phone: '+1234567892'
  },
  {
    name: 'John Student',
    email: 'student@school.com',
    password: 'student123',
    role: 'student',
    phone: '+1234567893'
  }
]

const importData = async () => {
  try {
    await User.deleteMany()
    await Course.deleteMany()

    console.log('🔄 Creating users...')
    
    // Create users ONE BY ONE to trigger the pre-save hook
    const createdUsers = []
    for (const userData of users) {
      const user = new User(userData)
      await user.save()
      createdUsers.push(user)
      console.log(`✅ Created user: ${user.email}`)
    }
    
    console.log('\n✅ All users created:', createdUsers.length)
    
    const teacher1 = createdUsers[1]._id
    const teacher2 = createdUsers[2]._id

    const courses = [
      {
        title: 'Programación Web Avanzada',
        description: 'Aprende a crear aplicaciones web modernas con React, Node.js y MongoDB',
        category: 'tech',
        level: 'Avanzado',
        instructor: teacher1,
        instructorName: 'Dr. Carlos Méndez',
        duration: '12 semanas',
        price: 299,
        rating: 4.9,
        studentsCount: 245,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        requirements: ['Conocimientos básicos de JavaScript', 'HTML y CSS', 'Git'],
        whatYouLearn: ['React.js avanzado', 'Node.js y Express', 'MongoDB', 'APIs REST']
      },
      {
        title: 'Diseño Gráfico Digital',
        description: 'Domina las herramientas profesionales de diseño y creatividad digital',
        category: 'art',
        level: 'Intermedio',
        instructor: teacher2,
        instructorName: 'Dra. Ana Rodríguez',
        duration: '10 semanas',
        price: 249,
        rating: 4.8,
        studentsCount: 189,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'
      },
      {
        title: 'Matemáticas Aplicadas',
        description: 'Resolución de problemas complejos con aplicaciones prácticas',
        category: 'science',
        level: 'Básico',
        instructor: teacher1,
        instructorName: 'Dr. Carlos Méndez',
        duration: '8 semanas',
        price: 199,
        rating: 4.7,
        studentsCount: 312,
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800'
      }
    ]

    await Course.insertMany(courses)

    console.log('\n✅ Data imported successfully!')
    console.log('\n📧 Login credentials:')
    console.log('Admin: admin@school.com / admin123')
    console.log('Teacher: carlos@school.com / teacher123')
    console.log('Student: student@school.com / student123')
    
    process.exit()
  } catch (error) {
    console.error('❌ Error importing data:', error)
    process.exit(1)
  }
}

const deleteData = async () => {
  try {
    await User.deleteMany()
    await Course.deleteMany()
    
    console.log('✅ Data deleted successfully!')
    process.exit()
  } catch (error) {
    console.error('❌ Error deleting data:', error)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  deleteData()
} else {
  importData()
}