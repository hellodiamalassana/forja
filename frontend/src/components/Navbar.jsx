import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiGrid, FiShield } from 'react-icons/fi';
import useAuthStore from '../store/useAuthStore';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dark-800/80 backdrop-blur-lg border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:animate-glow transition-all">
              <span className="text-2xl">⚡</span>
            </div>
            <span className="text-2xl font-bold glow-text">Forja</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              to="/pricing"
              className="text-gray-300 hover:text-primary-500 transition-colors font-medium"
            >
              Tarifs
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/builder"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>Créer une app</span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors">
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">{user?.name || 'Mon compte'}</span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-dark-700 transition-colors rounded-t-xl"
                    >
                      <FiGrid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-dark-700 transition-colors text-red-400"
                      >
                        <FiShield className="w-4 h-4" />
                        <span>Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-dark-700 transition-colors text-red-400 rounded-b-xl"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/auth" className="btn-primary">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
