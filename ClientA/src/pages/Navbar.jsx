import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold text-gray-900">
          MySSOproject
        </Link>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user.name}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}