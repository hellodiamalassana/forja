const prisma = require('./prisma');

async function logActivity(userId, action, details = null, req = null) {
  try {
    const data = {
      userId,
      action,
      details: details || {},
    };

    if (req) {
      data.ipAddress = req.ip || req.connection.remoteAddress;
      data.userAgent = req.get('user-agent');
    }

    await prisma.activityLog.create({ data });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - activity logging shouldn't break the app
  }
}

module.exports = { logActivity };
