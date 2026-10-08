const mongoose = require('mongoose');

const slaSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      unique: true,
      index: true
    },
    resolutionHours: {
      type: Number,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SLA', slaSchema);
