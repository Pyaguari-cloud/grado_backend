import Enrollment from '../models/enrollmentModel.js'
import Course from '../models/courseModel.js'
import User from '../models/userModel.js'

// @desc    Create enrollment
// @route   POST /api/enrollments
// @access  Private
export const createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    })

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      })
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      paymentAmount: course.price
    })

    // Update course students count
    course.studentsCount += 1
    await course.save()

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: courseId }
    })

    res.status(201).json({
      success: true,
      data: enrollment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Get user enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course')
      .sort('-createdAt')

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private/Admin
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort('-createdAt')

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Private
export const updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    res.json({
      success: true,
      data: enrollment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}