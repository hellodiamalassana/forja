import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { forjaAPI } from '../services/api';
import useAuthStore from '../store/useAuthStore';

function DashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, subData] = await Promise.all([
        forjaAPI.getProjects(),
        forjaAPI.getSubscription().catch(() => null),
      ]);

      setProjects(projectsData);
      setSubscription(subData);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Supprimer ce projet ?')) return;

    try {
      await forjaAPI.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success('Projet supprimé');
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Bienvenue, <span className="text-primary-500">{user?.name}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-3xl font-bold glow-text mb-1">
              {projects.length}
            </div>
            <div className="text-gray-400">Projets créés</div>
          </div>

          <div className="card">
            <div className="text-3xl font-bold glow-text mb-1">
              {subscription?.plan || 'Gratuit'}
            </div>
            <div className="text-gray-400">Plan actuel</div>
          </div>

          <div className="card">
            <div className="text-3xl font-bold glow-text mb-1">
              {subscription?.projectsRemaining ?? '∞'}
            </div>
            <div className="text-gray-400">Projets restants</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Mes projets</h2>
          <Link to="/builder" className="btn-primary flex items-center space-x-2">
            <FiPlus className="w-4 h-4" />
            <span>Nouveau projet</span>
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiPlus className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun projet</h3>
            <p className="text-gray-400 mb-6">
              Commencez par créer votre première application
            </p>
            <Link to="/builder" className="btn-primary inline-block">
              Créer un projet
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="card hover:border-primary-500/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary-500 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FiCalendar className="w-3 h-3" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/builder?project=${project.id}`}
                    className="btn-secondary flex-1 text-center"
                  >
                    Ouvrir
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscription Card */}
        {!subscription || subscription.plan === 'free' ? (
          <div className="card bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-primary-500/50 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Passez à la vitesse supérieure
                </h3>
                <p className="text-gray-300">
                  Débloquez des projets illimités et plus de plateformes
                </p>
              </div>
              <Link to="/pricing" className="btn-primary">
                Voir les offres
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardPage;
