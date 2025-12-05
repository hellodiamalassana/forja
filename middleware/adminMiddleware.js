const authMiddleware = require('./authMiddleware');

async function adminMiddleware(req, res, next) {
  // First check authentication
  await authMiddleware(req, res, (err) => {
    if (err) return next(err);

    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Accès refusé',
        details: 'Vous devez être administrateur pour accéder à cette ressource'
      });
    }

    next();
  });
}

module.exports = adminMiddleware;
