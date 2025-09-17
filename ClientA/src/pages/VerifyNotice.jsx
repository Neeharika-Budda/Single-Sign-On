import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BASE } from '../api/fetcher';

export default function VerifyNotice() {
  const [status, setStatus] = useState('Verifying your email…');
  const [verified, setVerified] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('❌ No verification token found.');
      return;
    }

    fetch(`${BASE}/api/auth/verify-email?token=${token}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === 'Email verified successfully') {
          setStatus('✅ Email verified! Redirecting to login…');
          setVerified(true);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus(`⚠️ ${data.message}`);
        }
      })
      .catch(() => {
        setStatus('⚠️ Something went wrong. Please try again.');
      });
  }, [params, navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Verification</h2>

          <div className="mb-6">
            <p className="text-gray-700">{status}</p>
          </div>

          {verified && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                Not redirected?
              </div>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {!verified && (
            <div className="space-y-4">
              <Link
                to="/register"
                className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Resend Verification
              </Link>
              <Link
                to="/login"
                className="block text-gray-600 hover:text-gray-800"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
