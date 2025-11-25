const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  criticalThreshold: {
    type: Number,
    required: true,
    default: 90
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);