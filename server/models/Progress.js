const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },

    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Progress', progressSchema);