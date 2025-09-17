import { Router } from 'express';
import passport from 'passport';
import auth from '../middlewares/auth.js';
import { verifyRefreshToken } from '../middlewares/refresh.js';
import {
  register,
  verifyEmail,
  login,
  mfaVerify,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  check,
  googleCallback,
  getLogs,
  getClients,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/mfa-verify', mfaVerify); 

router.post('/login', login);
router.post('/logout', auth, logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/token', verifyRefreshToken, refresh);
router.get('/check', auth, check);

/* ---- new dashboard endpoints ---- */
router.get('/logs', auth, getLogs);      // last 5 activities
router.get('/clients', auth, getClients); // active ClientA / ClientB status

/* Google OAuth */
router.post('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  googleCallback
);

export default router;
