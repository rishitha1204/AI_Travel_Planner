import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    // select: false means this field is excluded from query results by
    // default — callers must explicitly .select('+passwordHash') to get it,
    // which makes it much harder to accidentally leak a hash in a response.
    passwordHash: { type: String, required: true, select: false },
    // Bumped on logout (and would be bumped on password change, in a later
    // phase) to invalidate every refresh token issued before that point —
    // this is what makes "log out everywhere" possible without a token
    // blacklist/store.
    refreshTokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);