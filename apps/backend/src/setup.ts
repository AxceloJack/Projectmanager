import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let setupPromise: Promise<void> | null = null;

export function setupDefaultAdmin(): Promise<void> {
  if (!setupPromise) {
    setupPromise = runSetup();
  }
  return setupPromise;
}

async function runSetup() {
  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@axcelo.co' },
    });

    if (!adminExists) {
      const workspace = await prisma.workspace.upsert({
        where: { slug: 'axcelo-admin' },
        update: {},
        create: { name: 'Axcelo Admin', slug: 'axcelo-admin' },
      });

      const passwordHash = await bcrypt.hash('2008Milana2008!', 10);
      await prisma.user.create({
        data: {
          email: 'admin@axcelo.co',
          passwordHash,
          workspaceId: workspace.id,
          role: 'ADMIN',
          approved: true,
        },
      });
      console.log('✅ Default admin account created');
    }
  } catch (error) {
    console.error('Error setting up default admin:', error);
  }
}
