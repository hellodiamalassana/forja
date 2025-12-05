import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiGrid, FiActivity, FiShield, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forjaAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';

function AdminPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadStats();
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const data = await forjaAPI.get('/api/admin/stats');
      setStats(data);
    } catch (error) {
      toast.error('Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await forjaAPI.get('/api/admin/users');
      setUsers(data.users);
    } catch (error) {
      toast.error('Erreur de chargement des utilisateurs');
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await forjaAPI.patch(`/api/admin/users/${userId}`, {
        isActive: !isActive
      });
      toast.success('Utilisateur mis à jour');
      loadUsers();
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  const handleChangePlan = async (userId, newPlan) => {
    try {
      await forjaAPI.patch(`/api/admin/users/${userId}`, {
        plan: newPlan
      });
      toast.success('Plan mis à jour');
      loadUsers();
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400">Gestion de la plateforme Forja</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-dark-700">
          {[
            { id: 'dashboard', icon: FiGrid, label: 'Dashboard' },
            { id: 'users', icon: FiUsers, label: 'Utilisateurs' },
            { id: 'activity', icon: FiActivity, label: 'Activité' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <FiUsers className="w-8 h-8 text-primary-500" />
                  <span className="text-sm text-gray-400">Total</span>
                </div>
                <div className="text-3xl font-bold glow-text mb-1">
                  {stats.users.total}
                </div>
                <div className="text-sm text-gray-400">Utilisateurs</div>
                <div className="mt-2 text-xs text-primary-400">
                  +{stats.users.todaySignups} aujourd'hui
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <FiActivity className="w-8 h-8 text-green-500" />
                  <span className="text-sm text-gray-400">Actifs</span>
                </div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {stats.users.active}
                </div>
                <div className="text-sm text-gray-400">Actifs (7j)</div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <FiGrid className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-400">Projets</span>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {stats.projects.total}
                </div>
                <div className="text-sm text-gray-400">Total projets</div>
                <div className="mt-2 text-xs text-blue-400">
                  +{stats.projects.today} aujourd'hui
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <FiDollarSign className="w-8 h-8 text-yellow-500" />
                  <span className="text-sm text-gray-400">MRR</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {stats.revenue.monthly}€
                </div>
                <div className="text-sm text-gray-400">Revenus mensuels</div>
                <div className="mt-2 text-xs text-yellow-400">
                  {stats.subscriptions.active} abonnements
                </div>
              </div>
            </div>

            {/* Plans Distribution */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Distribution des Plans</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { plan: 'FREE', count: stats.users.byPlan.free, color: 'gray' },
                  { plan: 'PRO', count: stats.users.byPlan.pro, color: 'primary' },
                  { plan: 'BUSINESS', count: stats.users.byPlan.business, color: 'yellow' },
                ].map((item) => (
                  <div key={item.plan} className="bg-dark-700 rounded-xl p-4">
                    <div className="text-2xl font-bold mb-1">{item.count}</div>
                    <div className="text-sm text-gray-400">{item.plan}</div>
                    <div className="mt-2 h-2 bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color}-500`}
                        style={{
                          width: `${(item.count / stats.users.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
            </div>

            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4">Utilisateur</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Projets</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Inscription</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-dark-800">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.plan}
                          onChange={(e) => handleChangePlan(user.id, e.target.value)}
                          className="input py-1 px-2 text-sm"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                          <option value="BUSINESS">BUSINESS</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">{user._count.projects}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleUser(user.id, user.isActive)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs ${
                            user.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <FiCheck className="w-3 h-3" />
                              <span>Actif</span>
                            </>
                          ) : (
                            <>
                              <FiX className="w-3 h-3" />
                              <span>Suspendu</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-primary-500 hover:text-primary-400 text-sm">
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Activité Récente</h3>
            <p className="text-gray-400">Logs d'activité en cours de développement...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
