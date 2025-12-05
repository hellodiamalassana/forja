const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Non autorisé',
        details: 'Token manquant'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Non autorisé',
        details: 'Utilisateur non trouvé'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Non autorisé',
        details: 'Token invalide'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Non autorisé',
        details: 'Token expiré'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
}

module.exports = authMiddleware;
