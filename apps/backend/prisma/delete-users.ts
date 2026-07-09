import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete all users except admin@axcelo.co
    const result = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@axcelo.co',
        },
      },
    });

    console.log(`✅ Deleted ${result.count} users`);
    console.log('✅ Admin account remains');
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
