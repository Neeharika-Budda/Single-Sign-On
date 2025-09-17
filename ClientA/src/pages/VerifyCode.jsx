// src/pages/VerifyCode.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyMfaApi } from '../api/fetcher';
import { ShieldCheck } from 'lucide-react';

export default function VerifyCode() {
  const nav = useNavigate();
  const { pendingId, setPendingId, setUser } = useAuth();
  const { state } = useLocation(); // Expects { pendingId: '...', client: 'A' }

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (code.length !== 6) return setErr('6‑digit code required');

    try {
      setBusy(true);
      const res = await verifyMfaApi({ userId: pendingId, code, client: 'A' });
      setUser(res.user);
      setPendingId(null);          // clear
      nav('/');
    } catch (e) {
      setErr(e.message || 'Bad code');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-5">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold">Enter Verification Code</h2>
        </div>

        {err && (
          <p className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 mb-4 rounded text-sm">{err}</p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            maxLength={6}
            pattern="\d{6}"
            inputMode="numeric"
            className="w-full text-center text-xl tracking-widest px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
