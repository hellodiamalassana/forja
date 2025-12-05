const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const adminMiddleware = require('../middleware/adminMiddleware');
const bcrypt = require('bcryptjs');

// All routes require admin
router.use(adminMiddleware);

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      freeUsers,
      proUsers,
      businessUsers,
      activeSubscriptions,
      totalRevenue,
      todaySignups,
      todayProjects,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (logged in last 7 days)
      prisma.activityLog.groupBy({
        by: ['userId'],
        where: {
          action: 'login',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }).then(results => results.length),

      // Total projects
      prisma.project.count(),

      // Users by plan
      prisma.user.count({ where: { plan: 'FREE' } }),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.user.count({ where: { plan: 'BUSINESS' } }),

      // Active subscriptions
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),

      // Total revenue (PRO: 15€, BUSINESS: 49€)
      prisma.user.groupBy({
        by: ['plan'],
        where: {
          plan: { in: ['PRO', 'BUSINESS'] },
          subscription: {
            status: 'ACTIVE'
          }
        },
        _count: true
      }).then(results => {
        let total = 0;
        results.forEach(r => {
          if (r.plan === 'PRO') total += r._count * 15;
          if (r.plan === 'BUSINESS') total += r._count * 49;
        });
        return total;
      }),

      // Today's signups
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),

      // Today's projects
      prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        byPlan: {
          free: freeUsers,
          pro: proUsers,
          business: businessUsers
        },
        todaySignups
      },
      projects: {
        total: totalProjects,
        today: todayProjects
      },
      subscriptions: {
        active: activeSubscriptions,
        revenue: totalRevenue
      },
      revenue: {
        monthly: totalRevenue,
        annual: totalRevenue * 12
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - List all users with filters
router.get('/users', async (req, res, next) => {
  try {
    const { plan, role, search, page = 1, limit = 20 } = req.query;

    const where = {};

    if (plan) where.plan = plan;
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              activityLogs: true
            }
          },
          subscription: {
            select: {
              status: true,
              stripeCurrentPeriodEnd: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/:id - Get single user details
router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        subscription: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);

  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan, role, isActive } = req.body;

    // Prevent demoting yourself
    if (id === req.user.id && role === 'USER') {
      return res.status(400).json({
        error: 'Vous ne pouvez pas retirer vos propres droits admin'
      });
    }

    const updates = {};
    if (plan) updates.plan = plan;
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: id,
        action: 'admin_update',
        details: {
          updatedBy: req.user.email,
          changes: updates
        }
      }
    });

    res.json({
      user,
      message: 'Utilisateur mis à jour'
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Utilisateur supprimé'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/projects - List all projects
router.get('/projects', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              plan: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.project.count()
    ]);

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/activity - Recent activity logs
router.get('/activity', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/admin/create-admin - Create new admin user
router.post('/create-admin', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, mot de passe et nom requis'
      });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return res.status(400).json({
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        plan: 'BUSINESS',
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      user: admin,
      message: 'Administrateur créé avec succès'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/admin/revenue - Revenue analytics
router.get('/revenue', async (req, res, next) => {
  try {
    const { period = 'month' } = req.query; // 'day', 'week', 'month', 'year'

    // Calculate date range
    let startDate;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get subscriptions created in period
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            plan: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    let totalRevenue = 0;
    const breakdown = { PRO: 0, BUSINESS: 0 };

    subscriptions.forEach(sub => {
      if (sub.user.plan === 'PRO') {
        totalRevenue += 15;
        breakdown.PRO += 15;
      } else if (sub.user.plan === 'BUSINESS') {
        totalRevenue += 49;
        breakdown.BUSINESS += 49;
      }
    });

    res.json({
      period,
      totalRevenue,
      breakdown,
      subscriptionCount: subscriptions.length,
      projectedMonthly: totalRevenue,
      projectedAnnual: totalRevenue * 12
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
