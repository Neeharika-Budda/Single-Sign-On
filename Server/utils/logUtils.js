import ActivityLog from '../models/ActivityLog.js';

export const logEvent = async (userId, action, client) =>
  ActivityLog.create({ userId, action, client });
