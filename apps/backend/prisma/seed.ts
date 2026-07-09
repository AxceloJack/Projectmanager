import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Create admin workspace
  const adminWorkspace = await prisma.workspace.upsert({
    where: { slug: 'axcelo-admin' },
    update: {},
    create: {
      name: 'Axcelo Admin',
      slug: 'axcelo-admin',
    },
  });

  // Create admin user
  const passwordHash = await bcrypt.hash('2008Milana2008!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@axcelo.co' },
    update: {
      approved: true,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@axcelo.co',
      passwordHash,
      workspaceId: adminWorkspace.id,
      role: 'ADMIN',
      approved: true,
    },
  });

  console.log('✅ Admin user created/updated');
  console.log('📧 Email: admin@axcelo.co');
  console.log('🔑 Password: 2008Milana2008!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
