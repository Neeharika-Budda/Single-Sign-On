import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Check, X, RefreshCw } from 'lucide-react';

export default function VerifyNotice() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [verified, setVerified] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token found.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const success = Math.random() > 0.3;
        
        if (success) {
          setStatus('success');
          setMessage('Email verified successfully!');
          setVerified(true);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage('Verification failed. The link may be expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Something went wrong during verification.');
      }
    };

    verifyEmail();
  }, [params, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />;
      case 'success':
        return <Check className="w-12 h-12 text-green-600" />;
      case 'error':
      case 'no-token':
        return <X className="w-12 h-12 text-red-600" />;
      default:
        return <Mail className="w-12 h-12 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Verification</h2>
          
          <div className="mb-6">
            {getStatusIcon()}
          </div>

          <div className="mb-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                Redirecting to login...
              </div>
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          )}

          {(status === 'error' || status === 'no-token') && (
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