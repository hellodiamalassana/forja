const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'Email, mot de passe et nom requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Mot de passe trop court',
        details: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        details: 'Un compte existe déjà avec cet email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        plan: 'FREE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      user,
      token,
      message: 'Compte créé avec succès'
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'Email et mot de passe requis'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        details: 'Email ou mot de passe incorrect'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        details: 'Email ou mot de passe incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    res.json(user);

  } catch (error) {
    next(error);
  }
});

// PATCH /api/auth/profile - Update user profile
router.patch('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body;
    const updates = {};

    if (name) updates.name = name;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true
      }
    });

    res.json({
      user: updatedUser,
      message: 'Profil mis à jour'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
