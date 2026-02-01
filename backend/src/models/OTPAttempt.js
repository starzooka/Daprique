import mongoose from 'mongoose';

const otpAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['registration', 'login'],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      // Auto-delete records after 24 hours
      index: { expireAfterSeconds: 86400 },
    },
  },
  { timestamps: false }
);

// Create a compound index for email and createdAt to optimize queries
otpAttemptSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model('OTPAttempt', otpAttemptSchema);
