import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

interface CreateClientBody {
  name: string;
  email?: string;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const clients = await prisma.client.findMany({
      where: { workspaceId: req.user.workspaceId },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { name, email } = req.body as CreateClientBody;

    const client = await prisma.client.create({
      data: {
        workspaceId: req.user.workspaceId,
        name,
        email,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspaceId: req.user.workspaceId,
      },
      include: {
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: { comments: true },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { name, email } = req.body;

    const client = await prisma.client.updateMany({
      where: {
        id: req.params.id,
        workspaceId: req.user.workspaceId,
      },
      data: { name, email },
    });

    if (client.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const client = await prisma.client.deleteMany({
      where: {
        id: req.params.id,
        workspaceId: req.user.workspaceId,
      },
    });

    if (client.count === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
