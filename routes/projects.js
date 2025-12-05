const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects - Get all user projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        platforms: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json(projects);

  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé'
      });
    }

    // Check ownership
    if (project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé'
      });
    }

    res.json(project);

  } catch (error) {
    next(error);
  }
});

// POST /api/projects - Create/save project
router.post('/', async (req, res, next) => {
  try {
    const { name, description, sessionId, files, platforms } = req.body;

    // Validation
    if (!name || !sessionId || !files) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'name, sessionId et files sont requis'
      });
    }

    // Check project limit for free users
    if (req.user.plan === 'FREE') {
      const projectCount = await prisma.project.count({
        where: { userId: req.user.id }
      });

      if (projectCount >= 2) {
        return res.status(403).json({
          error: 'Limite atteinte',
          details: 'Vous avez atteint la limite de 2 projets. Passez à Pro pour plus.'
        });
      }
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description: description || '',
        sessionId,
        files,
        platforms: platforms || ['windows'],
        userId: req.user.id
      }
    });

    res.status(201).json({
      project,
      message: 'Projet créé'
    });

  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint violation (sessionId)
      return res.status(400).json({
        error: 'Projet déjà sauvegardé'
      });
    }
    next(error);
  }
});

// PATCH /api/projects/:id - Update project
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, files, platforms } = req.body;

    // Check ownership
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return res.status(404).json({
        error: 'Projet non trouvé'
      });
    }

    if (existingProject.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé'
      });
    }

    // Update
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (files) updates.files = files;
    if (platforms) updates.platforms = platforms;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updates
    });

    res.json({
      project: updatedProject,
      message: 'Projet mis à jour'
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({
        error: 'Projet non trouvé'
      });
    }

    if (project.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Accès refusé'
      });
    }

    // Delete
    await prisma.project.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Projet supprimé'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
