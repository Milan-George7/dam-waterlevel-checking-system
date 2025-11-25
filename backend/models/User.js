const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v.includes('@');
      },
      message: 'Email must contain @'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 4
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{1,10}$/.test(v);
      },
      message: 'Phone number must be maximum 10 digits'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'operator'],
    default: 'operator'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);