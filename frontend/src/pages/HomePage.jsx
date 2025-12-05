import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiCode, FiDownload, FiCpu } from 'react-icons/fi';

function HomePage() {
  const features = [
    {
      icon: <FiCpu className="w-8 h-8" />,
      title: 'Génération par IA',
      description: 'Décrivez votre application en français, Claude génère le code complet'
    },
    {
      icon: <FiCode className="w-8 h-8" />,
      title: 'Code Professionnel',
      description: 'Architecture Electron moderne, sécurisée et prête pour la production'
    },
    {
      icon: <FiDownload className="w-8 h-8" />,
      title: 'Multi-Plateformes',
      description: 'Exportez pour Windows (.exe), macOS (.dmg) et Linux (.AppImage)'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-2 mb-8">
              <FiZap className="text-primary-500" />
              <span className="text-sm text-primary-400 font-medium">
                Générez des applications desktop en quelques minutes
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Créez des applications
              <br />
              <span className="glow-text">sans coder</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Forja transforme vos idées en applications desktop professionnelles.
              Décrivez ce que vous voulez, l'IA génère le code et compile pour toutes les plateformes.
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Link to="/builder" className="btn-primary text-lg px-8 py-4">
                Commencer gratuitement
              </Link>
              <a href="#features" className="btn-secondary text-lg px-8 py-4">
                En savoir plus
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
              {[
                { value: '5 min', label: 'Temps de génération' },
                { value: '3', label: 'Plateformes supportées' },
                { value: '100%', label: 'Code personnalisable' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold glow-text mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Comment ça <span className="glow-text">fonctionne</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Trois étapes simples pour obtenir votre application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card hover:border-primary-500/50 transition-all group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="py-20 px-4 bg-dark-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Exemples d'<span className="glow-text">applications</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Voici quelques idées pour démarrer
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Calculatrice', desc: 'Interface moderne avec historique' },
              { title: 'Gestionnaire de tâches', desc: 'To-do list avec stockage local' },
              { title: 'Éditeur de notes', desc: 'Markdown avec prévisualisation' },
              { title: 'Gestion d\'inventaire', desc: 'Pour boutiques et entreprises' },
            ].map((example, i) => (
              <div key={i} className="card group hover:border-primary-500/50 cursor-pointer transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <h3 className="text-xl font-bold">{example.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{example.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-primary-500/50"
          >
            <h2 className="text-4xl font-bold mb-4">
              Prêt à créer votre première application ?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Rejoignez des centaines de créateurs qui utilisent Forja
            </p>
            <Link to="/builder" className="btn-primary text-lg px-10 py-4 inline-block">
              Démarrer maintenant
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
