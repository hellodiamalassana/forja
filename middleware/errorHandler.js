const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreur validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.message
    });
  }

  // Erreur Anthropic API
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Limite de requêtes API atteinte',
      details: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
    });
  }

  if (err.status === 401) {
    return res.status(401).json({
      error: 'Erreur d\'authentification API',
      details: 'Clé API invalide ou manquante'
    });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Une erreur interne s\'est produite';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
