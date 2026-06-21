import mongoose from 'mongoose';

const healthScoreExplanationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    summary: { type: String, default: '' },
    recommendations: { type: [String], default: [] },
    modelUsed: { type: String, default: '' },
    errorReason: { type: String, default: '' },
    generatedAt: { type: Date },
  },
  { _id: false }
);

const tripHealthScoreSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    scoringVersion: {
      type: String,
      required: true,
    },
    explanation: {
      type: healthScoreExplanationSchema,
      default: () => ({ status: 'pending' }),
    },
  },
  { timestamps: true }
);

tripHealthScoreSchema.index({ tripId: 1, userId: 1, createdAt: -1 });

export const TripHealthScore = mongoose.model('TripHealthScore', tripHealthScoreSchema);