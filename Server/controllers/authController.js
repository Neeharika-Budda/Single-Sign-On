import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import MfaCode from '../models/MfaCode.js';
import bcrypt from 'bcryptjs';
import {
  rotateRefreshToken,
  blacklistToken,
} from '../middlewares/refresh.js';
import { sendVerificationEmail, sendResetEmail } from '../utils/email.js';
import ActivityLog from '../models/ActivityLog.js';
import { broadcastForceLogout } from '../server.js';

const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

const logEvent = (userId, action, client = 'A') =>
  ActivityLog.create({ userId, action, client });

function issueAccessToken(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
  res.cookie('accessToken', token, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
}

function issueRefreshToken(userId, res, jtiOverride) {
  const jti = jtiOverride || uuidv4();
  const refreshToken = jwt.sign({ userId, jti }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return jti;
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!password || password.length < 8)
      return res.status(400).json({ message: 'Weak password' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });

    // verification
    const verifyToken = jwt.sign(
      { userId: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: '1h' }
    );

    const link = `${process.env.CLIENT_URL}/verify?token=${verifyToken}`;
    await sendVerificationEmail(email, link);
    // console.log(`Sending email to: ${email} with token: ${verifyToken}`);

    res.status(201).json({ message: 'Registered. Verify email.' });
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
    res.status(500).json({ message: err.message });
  }
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  if (!token) return res.status(400).json({ message: 'Missing token' });
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified)
      return res.status(200).json({ message: 'Already verified' });
    console.log(user);
    user.isVerified = true;
    await user.save();
    await logEvent(user._id, 'Email verified');

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
}

 export async function login(req, res) {
   try {
    const { email, password } = req.body;
    console.log('hey')
     const user = await User.findOne({ email });
     if (!user) return res.status(401).json({ message: 'Invalid creds' });
     if (!user.isVerified) return res.status(401).json({ message: 'Verify email first' });

     const ok = await user.comparePassword(password);
     if (!ok) return res.status(401).json({ message: 'Invalid creds' });

     /* ---------- MFA STEP ---------- */
     // 6‑digit random code
     const otp = Math.floor(100000 + Math.random() * 900000).toString();
     const hash = await bcrypt.hash(otp, 10);
 
     // Store hashed code (5‑min TTL)
     await MfaCode.create({
       userId: user._id,
       codeHash: hash,
       expiresAt: Date.now() + 5 * 60 * 1000,
     });
     console.log('hey')
     // Send email
    await sendVerificationEmail(
      user.email,
       `<p>Your login code is: <strong>${otp}</strong> (valid 5 min)</p>`
     );
 
     res.json({ mfaRequired: true, userId: user._id });
   } catch (err) {
     res.status(500).json({ message: err.message });
   }
 }

export async function mfaVerify(req, res) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: 'Missing data' });

    const record = await MfaCode.findOne({ userId }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: 'Code expired' });

    const valid = await bcrypt.compare(code, record.codeHash);
    if (!valid) return res.status(400).json({ message: 'Invalid code' });

    // success: delete code, issue tokens
    await MfaCode.deleteMany({ userId });
    issueAccessToken(userId, res);
    issueRefreshToken(userId, res);

    const user = await User.findById(userId);
    await logEvent(userId, 'Logged in', req.body.client || 'A');

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



export async function googleCallback(req, res) {
  // passport attaches user to req.user
  const user = req.user;
  issueAccessToken(user._id, res);
  issueRefreshToken(user._id, res);
  res.redirect(process.env.CLIENT_URL);
}

export async function refresh(req, res) {
  try {
    const { userId, jti } = req.user;

    // rotate: blacklist old
    await blacklistToken(jti, 7 * 24 * 60 * 60);

    issueAccessToken(userId, res);
    const newJti = issueRefreshToken(userId, res);
    res.json({ message: 'Token refreshed' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

export async function logout(req, res) {
  try {
    const { client = 'A' } = req.body;           // ← grab client or default
    const rt = req.cookies.refreshToken;

    if (rt) {
      const decoded = jwt.decode(rt) || {};
      if (decoded.jti && decoded.exp) {
        await blacklistToken(
          decoded.jti,
          decoded.exp - Math.floor(Date.now() / 1000)
        );
      }
    }

    await logEvent(req.user.userId, 'Logged out', client); // now defined
    
    broadcastForceLogout(req.user.userId);
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ message: 'Server error during logout' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If account exists, email sent' });

    const token = jwt.sign({ userId: user._id }, process.env.EMAIL_SECRET, {
      expiresIn: '30m',
    });
    const link = `${process.env.CLIENT_URL}/reset?token=${token}`;
    await sendResetEmail(email, link);
    res.json({ message: 'Email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 8)
      return res.status(400).json({ message: 'Weak password' });

    const { userId } = jwt.verify(token, process.env.EMAIL_SECRET);
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'Invalid link' });

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
}

export async function check(req, res) {
  try {
    const fullUser = await User.findById(req.user.userId).select('name email');
    if (!fullUser) return res.status(404).json({ message: 'User not found' });
    res.json({ id: fullUser._id, name: fullUser.name, email: fullUser.email });
  } catch (e) {
    res.status(401).json({ message: 'Unauthenticated' });
  }
}


export async function getLogs(req, res) {
  const logs = await ActivityLog.find({ userId: req.user.userId })
    .sort({ time: -1 })
    .limit(5);
  res.json(logs);
}

export async function getClients(req, res) {
  // Simple logic: if user has “Logged in” but not subsequent “Logged out” for A/B
  const logs = await ActivityLog.find({ userId: req.user.userId })
    .sort({ time: -1 });

  const status = { A: false, B: false };
  for (const log of logs) {
    if (status[log.client] !== undefined) {
      if (log.action === 'Logged in') status[log.client] = true;
      if (log.action === 'Logged out' && !status[log.client]) status[log.client] = false;
    }
    if (status.A && status.B) break; // both resolved
  }
  res.json(status);
}