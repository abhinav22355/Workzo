const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profession: {
      type: String,
      required: [true, 'Profession is required'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    serviceCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
      },
    ],
    serviceArea: {
      type: String,
      required: [true, 'Service area or cities served is required'],
      trim: true,
    },
    pricing: {
      hourlyRate: {
        type: Number,
        default: 299,
      },
      startingRate: {
        type: Number,
        default: 199,
      },
      visitingCharge: {
        type: Number,
        default: 99,
      },
    },
    availability: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00',
        },
        end: {
          type: String,
          default: '19:00',
        },
      },
      unavailableDates: {
        type: [String],
        default: [],
      },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    profileImage: {
      type: String,
      default: '',
    },
    badges: {
      type: [String],
      default: ['Verified Background'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
workerProfileSchema.index({ profession: 'text', description: 'text', serviceArea: 'text' });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
