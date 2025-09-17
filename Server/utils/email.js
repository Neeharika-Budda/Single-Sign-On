import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Use Gmail’s built‑in “service” shortcut
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ← the app‑password
  },
});

// ---------- GENERIC SEND HELPERS ---------- //
export async function sendVerificationEmail(email, link) {
  await transporter.sendMail({
    from: `"MERN‑SSO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below (valid 1 hour):</p>
      <a href="${link}">${link}</a>
    `,
  });
  console.log(`✅ Verification email sent to ${email}`);
}

export async function sendResetEmail(email, link) {
  await transporter.sendMail({
    from: `"MERN‑SSO" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below (valid 30 minutes):</p>
      <a href="${link}">${link}</a>
    `,
  });
  console.log(`✅ Reset email sent to ${email}`);
}
