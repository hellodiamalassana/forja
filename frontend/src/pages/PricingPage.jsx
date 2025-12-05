import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { forjaAPI } from '../services/api';

function PricingPage() {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (priceId, planName) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter d\'abord');
      return;
    }

    setLoading(planName);

    try {
      const { url } = await forjaAPI.createCheckoutSession(priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erreur lors de la souscription');
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: '',
      description: 'Pour découvrir Forja',
      features: [
        { text: '2 projets', included: true },
        { text: 'Export Windows uniquement', included: true },
        { text: 'Support communautaire', included: true },
        { text: 'Export Mac/Linux', included: false },
        { text: 'Projets illimités', included: false },
        { text: 'Support prioritaire', included: false },
      ],
      cta: 'Commencer',
      ctaLink: '/builder',
      popular: false,
    },
    {
      name: 'Pro',
      price: '15',
      period: '/mois',
      description: 'Pour les développeurs',
      features: [
        { text: 'Projets illimités', included: true },
        { text: 'Export Windows, Mac, Linux', included: true },
        { text: 'Génération prioritaire', included: true },
        { text: 'Templates premium', included: true },
        { text: 'Support email', included: true },
        { text: 'Branding personnalisé', included: false },
      ],
      cta: 'Souscrire',
      priceId: 'price_pro_monthly',
      popular: true,
    },
    {
      name: 'Business',
      price: '49',
      period: '/mois',
      description: 'Pour les équipes',
      features: [
        { text: 'Tout du plan Pro', included: true },
        { text: 'Branding personnalisé', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'API access', included: true },
        { text: 'Multiple users', included: true },
        { text: 'SLA garanti', included: true },
      ],
      cta: 'Souscrire',
      priceId: 'price_business_monthly',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Tarifs <span className="glow-text">simples</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins.
            Changez ou annulez à tout moment.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${
                plan.popular
                  ? 'border-primary-500 ring-2 ring-primary-500/50'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULAIRE
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                <div className="flex items-end justify-center mb-1">
                  <span className="text-5xl font-bold glow-text">
                    {plan.price}€
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 ml-2 mb-2">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    {feature.included ? (
                      <FiCheck className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    ) : (
                      <FiX className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included ? 'text-gray-300' : 'text-gray-600'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.ctaLink ? (
                <Link
                  to={plan.ctaLink}
                  className={`w-full text-center ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.name)}
                  disabled={loading === plan.name}
                  className={`w-full ${
                    plan.popular ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {loading === plan.name ? 'Chargement...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Questions fréquentes
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Puis-je changer de plan à tout moment ?',
                a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.',
              },
              {
                q: 'Qu\'arrive-t-il si je dépasse ma limite de projets ?',
                a: 'Pour le plan gratuit, vous devrez upgrader. Les plans payants n\'ont pas de limite.',
              },
              {
                q: 'Les exécutables générés sont-ils vraiment utilisables ?',
                a: 'Oui ! Les applications générées sont des vrais projets Electron prêts pour la production.',
              },
              {
                q: 'Puis-je modifier le code généré ?',
                a: 'Absolument. Tout le code est à vous et peut être modifié librement.',
              },
            ].map((faq, i) => (
              <div key={i} className="card">
                <h3 className="text-lg font-bold mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
