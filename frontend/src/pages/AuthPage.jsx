import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { forjaAPI } from '../services/api';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await forjaAPI.login(formData.email, formData.password);
        toast.success('Connexion réussie !');
      } else {
        response = await forjaAPI.register(
          formData.email,
          formData.password,
          formData.name
        );
        toast.success('Compte créé !');
      }

      login(response.user, response.token);
      navigate('/builder');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(
        error.response?.data?.error || 'Erreur d\'authentification'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-gray-400">
            {isLogin
              ? 'Accédez à vos projets'
              : 'Créez votre compte Forja'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">Nom</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="input w-full pl-12"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@exemple.com"
                className="input w-full pl-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input w-full pl-12"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading
              ? 'Chargement...'
              : isLogin
              ? 'Se connecter'
              : 'Créer un compte'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-500 hover:text-primary-400 text-sm"
            >
              {isLogin
                ? 'Pas de compte ? Inscrivez-vous'
                : 'Déjà un compte ? Connectez-vous'}
            </button>
          </div>
        </form>

        {/* Demo note */}
        <div className="mt-6 card bg-primary-500/10 border-primary-500/30">
          <p className="text-sm text-gray-300">
            <strong>Mode démo :</strong> Pour tester, créez un compte avec n'importe quel email.
            L'authentification sera liée à la base de données une fois configurée.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
