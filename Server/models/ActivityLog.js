// /server/models/ActivityLog.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },   // e.g. "Logged in"
  client: { type: String, enum: ['A', 'B'] }, // which SPA
  time:   { type: Date, default: Date.now },
});

export default mongoose.model('ActivityLog', activityLogSchema);
