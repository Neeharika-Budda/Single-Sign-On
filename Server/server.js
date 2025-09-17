import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import './config/passport.js';
import rateLimiter from './middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const server = http.createServer(app); 

// ── Middleware ─────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_B],
    credentials: true,
  })
);
app.use(rateLimiter); // global rate limiting

app.use(passport.initialize());

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => res.send('MERN‑SSO API Running'));

const io = new SocketIO(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_B],
    credentials: true,
  },
});

const userSockets = new Map(); // userId → Set(socketId)

// WebSocket authentication using accessToken cookie
io.use((socket, next) => {
  const cookies = Object.fromEntries(
    (socket.handshake.headers.cookie || '')
      .split('; ')
      .map((c) => c.split('='))
  );
  const token = cookies.accessToken;
  if (!token) return next(new Error('No token provided'));

  try {
    const { userId } = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const uid = socket.userId;
  if (!userSockets.has(uid)) userSockets.set(uid, new Set());
  userSockets.get(uid).add(socket.id);

  console.log(`🔗 Socket connected: ${socket.id} (User ${uid})`);

  socket.on('disconnect', () => {
    userSockets.get(uid)?.delete(socket.id);
    console.log(`❌ Socket disconnected: ${socket.id} (User ${uid})`);
  });
});

// Function to call from logout controller
export function broadcastForceLogout(userId) {
  const sockets = userSockets.get(userId) || [];
  for (const socketId of sockets) {
    io.to(socketId).emit('force-logout');
  }
}

// ── Database & Launch ──────────────────────────

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
