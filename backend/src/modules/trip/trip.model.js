import mongoose from 'mongoose';

// Shared with trip.validation.js so the Zod schema and the Mongoose schema
// can never drift out of sync on what a valid category is.
export const ACTIVITY_CATEGORIES = ['sightseeing', 'food', 'adventure', 'relaxation', 'culture', 'transport'];

const activitySchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'time must be in HH:MM 24-hour format'],
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    estimatedCost: { type: Number, required: true, min: 0 },
    category: { type: String, enum: ACTIVITY_CATEGORIES, required: true },
    location: {
      name: { type: String, trim: true, maxlength: 140 },
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    durationMinutes: { type: Number, required: true, min: 1, max: 24 * 60 },
    // Distinguishes manually-added activities from AI-generated ones. Always
    // 'user' in this phase — wired up to 'ai' once Phase 4 adds generation.
    source: { type: String, enum: ['user', 'ai'], default: 'user' },
  },
  { _id: true, timestamps: false }
);

const daySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 1 },
    date: { type: Date },
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    destination: {
      city: { type: String, required: true, trim: true, maxlength: 100 },
      country: { type: String, required: true, trim: true, maxlength: 100 },
      coordinates: {
        lat: { type: Number, min: -90, max: 90 },
        lng: { type: Number, min: -180, max: 180 },
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: {
      total: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 3 },
    },
    status: { type: String, enum: ['draft', 'confirmed', 'completed'], default: 'draft' },
    itinerary: { type: [daySchema], default: [] },
  },
  { timestamps: true }
);

// Defense in depth: the same rule is enforced by Zod on the way in
// (trip.validation.js), but enforcing it again at the schema level means
// it can never be violated even by a future code path that bypasses
// validation, e.g. a direct repository call from a script or another module.
tripSchema.pre('validate', function enforceDateOrder() {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    throw new Error('endDate must be after startDate');
  }
});

tripSchema.index({ userId: 1, createdAt: -1 });

export const Trip = mongoose.model('Trip', tripSchema);