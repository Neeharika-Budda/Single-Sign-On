import mongoose from 'mongoose';

const mfaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    codeHash: String,              // bcrypt hash of OTP
    expiresAt: Date,
  },
  { timestamps: true }
);

// auto‑delete expired docs
mfaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('MfaCode', mfaSchema);
