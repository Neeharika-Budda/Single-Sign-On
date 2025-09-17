import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotApi } from '../api/fetcher.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await forgotApi({ email });
    setMsg('If the account exists, reset link sent.');
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Forgot Password</h2>
          
          {msg ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                {msg}
              </div>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send link
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}