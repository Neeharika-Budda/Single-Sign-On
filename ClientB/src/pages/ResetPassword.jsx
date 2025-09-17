import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { resetApi } from '../api/fetcher.js';

export default function PasswordReset() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const passwordMatch = password === confirmPassword && password.length > 0;
  const isPasswordValid = Object.values(passwordStrength).every(Boolean);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    
    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setErr('Password does not meet requirements');
      return;
    }

    setLoading(true);

    try {
      await resetApi({ token, password });
      setMsg('Password reset successfully! Redirecting...');
      setTimeout(() => nav('/login'), 2000);
    } catch (e) {
      setErr(e.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => nav('/forgot')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Set New Password</h2>
          
          {msg ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                {msg}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {err}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600">Password requirements:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Contains a number</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordStrength.hasSpecial ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Contains a special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      confirmPassword && (passwordMatch ? 'border-green-300' : 'border-red-300')
                    }`}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {/* <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}> 
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button> */}
                </div>
                {confirmPassword && (
                  <p className={`mt-1 text-xs ${passwordMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordMatch ? 'Passwords match!' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !passwordMatch || !isPasswordValid}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}