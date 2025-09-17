import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './pages/Navbar'
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VerifyNotice from './pages/VerifyNotice';
import VerifyCode from './pages/VerifyCode';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/ResetPassword';

export default function App() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
         <Route path="/" element={<Dashboard />}/>
        {/* <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} /> */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/verify" element={<VerifyNotice />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<PasswordReset />} />
        <Route path="/verify-mfa" element={<VerifyCode />} />
      </Routes>
    </div>
  );
}