import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jti: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL
});

export default mongoose.model('TokenBlacklist', tokenBlacklistSchema);
