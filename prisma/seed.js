const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@forja.dev' },
    update: {},
    create: {
      email: 'admin@forja.dev',
      name: 'Super Admin',
      password: adminPassword,
      plan: 'BUSINESS',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@forja.dev' },
    update: {},
    create: {
      email: 'demo@forja.dev',
      name: 'Demo User',
      password: hashedPassword,
      plan: 'FREE',
      role: 'USER',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create a sample project
  const sampleProject = await prisma.project.upsert({
    where: { sessionId: 'sample-session-1' },
    update: {},
    create: {
      name: 'Ma Première App',
      description: 'Une calculatrice simple',
      sessionId: 'sample-session-1',
      userId: demoUser.id,
      files: {
        'package.json': '{"name": "calculator", "version": "1.0.0"}',
        'main.js': 'console.log("Hello from Electron");',
      },
      platforms: ['windows'],
    },
  });

  console.log('✅ Created sample project:', sampleProject.name);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
