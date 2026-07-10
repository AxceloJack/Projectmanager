import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const forms = await prisma.campaignForm.findMany({
      where: { client: { workspaceId: req.user.workspaceId } },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(forms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { clientId, month } = req.body as { clientId?: string; month?: string };

    if (!clientId || !month) {
      return res.status(400).json({ error: 'Client and month are required' });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, workspaceId: req.user.workspaceId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const form = await prisma.campaignForm.create({
      data: { clientId, month },
      include: { client: { select: { id: true, name: true } } },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const form = await prisma.campaignForm.findFirst({
      where: { id: req.params.id, client: { workspaceId: req.user.workspaceId } },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    await prisma.campaignForm.delete({ where: { id: form.id } });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

export default router;
