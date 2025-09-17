import rateLimit from 'express-rate-limit';

export default rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // per IP
  standardHeaders: true,
  legacyHeaders: false,
});
