require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const stripeRoutes = require('./routes/stripe');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/config');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use('/api/', limiter);

// Stripe webhook needs raw body, so handle it before body parsing
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parsing for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`🚀 Serveur Forja démarré sur le port ${PORT}`);
  console.log(`📝 Mode: ${config.nodeEnv}`);
  console.log(`🔑 API Claude: ${config.anthropicApiKey ? 'Configurée ✓' : 'Non configurée ✗'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configuré ✓' : 'Non configuré ✗'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Configurée ✓' : 'Non configurée ✗'}`);

  // Test database connection
  const prisma = require('./lib/prisma');
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
  }
});

module.exports = app;
