import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import TokenBlacklist from '../models/tokenBlacklist.js';
import User from '../models/User.js';

export async function verifyRefreshToken(req, res, next) {
  try {
    const token = req.cookies['refreshToken'];
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // is blacklisted?
    const black = await TokenBlacklist.findOne({ jti: decoded.jti });
    if (black) return res.status(401).json({ message: 'Token reuse detected' });

    req.user = decoded;
    req.tokenJti = decoded.jti;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function rotateRefreshToken(userId) {
  const jti = uuidv4();
  const refreshToken = jwt.sign({ userId, jti }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  return { refreshToken, jti };
}

export async function blacklistToken(jti, expiresInSeconds) {
  await TokenBlacklist.create({
    jti,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  });
}
