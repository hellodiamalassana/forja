const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const electronGenerator = require('../services/electronGenerator');
const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

// Optional auth middleware - attaches user if token is valid but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, plan: true }
      });
      if (user) req.user = user;
    }
  } catch (error) {
    // Ignore auth errors for optional auth
  }
  next();
};

// Store sessions in memory (use Redis/DB in production)
const sessions = new Map();

// POST /api/generate - Generate code from user description
router.post('/generate', optionalAuth, async (req, res, next) => {
  try {
    const { description, sessionId, conversationHistory } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: 'Description manquante',
        details: 'Veuillez fournir une description de l\'application'
      });
    }

    // Get or create session
    const currentSessionId = sessionId || uuidv4();
    let session = sessions.get(currentSessionId) || {
      id: currentSessionId,
      history: [],
      currentProject: null
    };

    // Generate code using Claude
    const result = await claudeService.generateElectronApp(
      description,
      session.history
    );

    // Update session
    session.history.push(
      { role: 'user', content: description },
      { role: 'assistant', content: result.aiResponse }
    );
    session.currentProject = result.code;
    sessions.set(currentSessionId, session);

    // Auto-save project if user is authenticated
    let savedProject = null;
    if (req.user) {
      try {
        // Extract project name from description or use default
        const projectName = description.substring(0, 50).trim() || 'Mon Application';

        savedProject = await prisma.project.create({
          data: {
            name: projectName,
            description: description,
            sessionId: currentSessionId,
            files: result.code.files || result.files,
            platforms: ['windows'],
            userId: req.user.id
          }
        });
      } catch (error) {
        // Ignore save errors (e.g., duplicate sessionId)
        console.warn('Failed to auto-save project:', error.message);
      }
    }

    res.json({
      sessionId: currentSessionId,
      aiResponse: result.aiResponse,
      code: result.code,
      files: result.files,
      projectId: savedProject?.id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/modify - Modify existing code
router.post('/modify', optionalAuth, async (req, res, next) => {
  try {
    const { sessionId, modification, currentCode } = req.body;

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session non trouvée',
        details: 'Veuillez d\'abord générer un projet'
      });
    }

    if (!modification || !modification.trim()) {
      return res.status(400).json({
        error: 'Modification manquante'
      });
    }

    const session = sessions.get(sessionId);

    // Modify code using Claude
    const result = await claudeService.modifyElectronApp(
      modification,
      currentCode || session.currentProject,
      session.history
    );

    // Update session
    session.history.push(
      { role: 'user', content: modification },
      { role: 'assistant', content: result.aiResponse }
    );
    session.currentProject = result.code;
    sessions.set(sessionId, session);

    // Update project in database if user is authenticated
    if (req.user) {
      try {
        await prisma.project.update({
          where: { sessionId },
          data: {
            files: result.code.files || result.files,
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.warn('Failed to update project:', error.message);
      }
    }

    res.json({
      aiResponse: result.aiResponse,
      code: result.code,
      files: result.files,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/build - Build executable
router.post('/build', async (req, res, next) => {
  try {
    const { sessionId, platforms } = req.body;

    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(404).json({
        error: 'Session non trouvée'
      });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        error: 'Plateformes manquantes',
        details: 'Veuillez spécifier au moins une plateforme (windows, mac, linux)'
      });
    }

    const session = sessions.get(sessionId);

    // Build executables
    const buildResult = await electronGenerator.buildExecutables(
      session.currentProject,
      platforms,
      sessionId
    );

    res.json({
      success: true,
      downloads: buildResult.downloadUrls,
      buildTime: buildResult.buildTime,
      platforms: platforms
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/session/:id - Get session info
router.get('/session/:id', (req, res) => {
  const { id } = req.params;

  if (!sessions.has(id)) {
    return res.status(404).json({
      error: 'Session non trouvée'
    });
  }

  const session = sessions.get(id);
  res.json({
    sessionId: id,
    messageCount: session.history.length,
    hasProject: !!session.currentProject,
    createdAt: session.createdAt || new Date().toISOString()
  });
});

// DELETE /api/session/:id - Delete session
router.delete('/session/:id', (req, res) => {
  const { id } = req.params;

  if (!sessions.has(id)) {
    return res.status(404).json({
      error: 'Session non trouvée'
    });
  }

  sessions.delete(id);
  res.json({
    success: true,
    message: 'Session supprimée'
  });
});

module.exports = router;
