import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Invalid email'],
    },
    password: { type: String },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.comparePassword = async function (pw) {
  return bcrypt.compare(pw, this.password || '');
};

export default mongoose.model('User', userSchema);
