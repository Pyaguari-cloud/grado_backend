import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['tech', 'art', 'science', 'languages', 'business', 'other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Básico', 'Intermedio', 'Avanzado']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  studentsCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'default-course.jpg'
  },
  syllabus: [{
    title: String,
    description: String,
    duration: String
  }],
  requirements: [String],
  whatYouLearn: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const Course = mongoose.model('Course', courseSchema)

export default Course