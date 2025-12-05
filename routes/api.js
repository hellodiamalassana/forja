const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const electronGenerator = require('../services/electronGenerator');
const { v4: uuidv4 } = require('uuid');

// Store sessions in memory (use Redis/DB in production)
const sessions = new Map();

// POST /api/generate - Generate code from user description
router.post('/generate', async (req, res, next) => {
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

    res.json({
      sessionId: currentSessionId,
      aiResponse: result.aiResponse,
      code: result.code,
      files: result.files,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/modify - Modify existing code
router.post('/modify', async (req, res, next) => {
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
