import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create workspace without owner first
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Axcelo',
        slug: 'axcelo-main',
      },
    });

    // Now create the user
    const user = await prisma.user.create({
      data: {
        email: 'jack@axcelo.com',
        passwordHash: await bcrypt.hash('password123', 10),
        workspaceId: workspace.id,
        role: 'ADMIN',
      },
    });

    // Update workspace to point to the real owner
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { ownerId: user.id },
    });

    console.log('✅ Workspace & User created');

    // Create sample client
    const client = await prisma.client.create({
      data: {
        workspaceId: workspace.id,
        name: 'Tech Startup Inc',
        email: 'hello@techstartup.com',
      },
    });

    console.log('✅ Sample client created');

    // Create sample tasks
    await prisma.task.create({
      data: {
        clientId: client.id,
        title: 'Welcome Email Campaign',
        description: 'Design and build the welcome email series for new users',
        dueDate: new Date('2026-07-15'),
        status: 'DESIGN_PHASE',
        figmaLink: 'https://figma.com/file/example',
      },
    });

    await prisma.task.create({
      data: {
        clientId: client.id,
        title: 'Newsletter Template',
        description: 'Create responsive newsletter template',
        dueDate: new Date('2026-07-20'),
        status: 'CLIENT_REVIEW',
        figmaLink: 'https://figma.com/file/example2',
      },
    });

    await prisma.task.create({
      data: {
        clientId: client.id,
        title: 'Promo Campaign',
        description: 'Summer promotion email series',
        dueDate: new Date('2026-07-25'),
        status: 'NOT_STARTED',
      },
    });

    console.log('✅ Sample tasks created');
    console.log('\n🎯 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    jack@axcelo.com');
    console.log('Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
