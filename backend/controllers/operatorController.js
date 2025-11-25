const User = require('../models/User');

// @desc    Get all operators
// @route   GET /api/operators
// @access  Private/Admin
exports.getOperators = async (req, res) => {
  try {
    const operators = await User.find({ role: 'operator' }).select('-password');
    res.json({
      success: true,
      count: operators.length,
      data: operators
    });
  } catch (error) {
    console.error('Get operators error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add new operator
// @route   POST /api/operators
// @access  Private/Admin
exports.addOperator = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: 'Email must contain @' });
    }

    if (phoneNumber && !/^\d{1,10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be maximum 10 digits' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create operator
    const operator = await User.create({
      email: email.toLowerCase(),
      password,
      phoneNumber,
      role: 'operator'
    });

    res.status(201).json({
      success: true,
      data: {
        id: operator._id,
        email: operator.email,
        phoneNumber: operator.phoneNumber,
        role: operator.role
      }
    });
  } catch (error) {
    console.error('Add operator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update operator
// @route   PUT /api/operators/:id
// @access  Private/Admin
exports.updateOperator = async (req, res) => {
  try {
    const { email, password, phoneNumber } = req.body;

    const operator = await User.findById(req.params.id);

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    if (operator.role !== 'operator') {
      return res.status(400).json({ message: 'Cannot update admin user' });
    }

    // Validation
    if (email && !email.includes('@')) {
      return res.status(400).json({ message: 'Email must contain @' });
    }

    if (phoneNumber && !/^\d{1,10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be maximum 10 digits' });
    }

    // Check if email is already taken by another user
    if (email && email !== operator.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (email) operator.email = email.toLowerCase();
    if (password) operator.password = password;
    if (phoneNumber !== undefined) operator.phoneNumber = phoneNumber;

    await operator.save();

    res.json({
      success: true,
      data: {
        id: operator._id,
        email: operator.email,
        phoneNumber: operator.phoneNumber,
        role: operator.role
      }
    });
  } catch (error) {
    console.error('Update operator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete operator
// @route   DELETE /api/operators/:id
// @access  Private/Admin
exports.deleteOperator = async (req, res) => {
  try {
    const operator = await User.findById(req.params.id);

    if (!operator) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    if (operator.role !== 'operator') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Operator deleted successfully'
    });
  } catch (error) {
    console.error('Delete operator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};