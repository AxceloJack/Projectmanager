import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import taskRoutes from './routes/tasks.js';
import publicRoutes from './routes/public.js';
import slackRoutes from './routes/slack.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const prisma = new PrismaClient();

async function setupDefaultAdmin() {
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/slack', slackRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

setupDefaultAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
