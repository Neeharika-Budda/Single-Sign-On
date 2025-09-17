import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  try {
    const token = req.cookies['accessToken'];
    if (!token) return res.status(401).json({ message: 'Unauthenticated' });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
