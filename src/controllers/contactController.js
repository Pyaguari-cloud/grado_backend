import Contact from '../models/contactModel.js'

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    })

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will contact you soon!',
      data: contact
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Get all contacts
// @route   GET /api/contact
// @access  Private/Admin
export const getContacts = async (req, res) => {
  try {
    const { status } = req.query
    
    let query = {}
    if (status) {
      query.status = status
    }

    const contacts = await Contact.find(query).sort('-createdAt')

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      })
    }

    res.json({
      success: true,
      data: contact
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}