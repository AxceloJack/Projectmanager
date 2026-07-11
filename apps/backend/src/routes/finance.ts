import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const VALID_CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD'];

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const entries = await prisma.financeEntry.findMany({
      where: { workspaceId: req.user.workspaceId },
      orderBy: { date: 'desc' },
    });

    const workspace = await prisma.workspace.findUnique({
      where: { id: req.user.workspaceId },
      select: { currency: true },
    });

    res.json({ entries, currency: workspace?.currency || 'GBP' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch finance entries' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { date, description, category, type, amount, status, notes } = req.body;

    if (!description || amount === undefined || amount === null || !date) {
      return res.status(400).json({ error: 'Date, description and amount are required' });
    }

    const entry = await prisma.financeEntry.create({
      data: {
        workspaceId: req.user.workspaceId,
        date: new Date(date),
        description,
        category: category || null,
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        amount: Number(amount),
        status: status === 'PENDING' ? 'PENDING' : 'PAID',
        notes: notes || null,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create finance entry' });
  }
});

router.patch('/currency', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { currency } = req.body as { currency?: string };
    if (!currency || !VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    await prisma.workspace.update({
      where: { id: req.user.workspaceId },
      data: { currency },
    });

    res.json({ currency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update currency' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const existing = await prisma.financeEntry.findFirst({
      where: { id: req.params.id, workspaceId: req.user.workspaceId },
    });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    const { date, description, category, type, amount, status, notes } = req.body;

    const entry = await prisma.financeEntry.update({
      where: { id: existing.id },
      data: {
        date: date ? new Date(date) : undefined,
        description,
        category: category ?? undefined,
        type: type ? (type === 'INCOME' ? 'INCOME' : 'EXPENSE') : undefined,
        amount: amount !== undefined ? Number(amount) : undefined,
        status: status ? (status === 'PENDING' ? 'PENDING' : 'PAID') : undefined,
        notes: notes ?? undefined,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update finance entry' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const existing = await prisma.financeEntry.findFirst({
      where: { id: req.params.id, workspaceId: req.user.workspaceId },
    });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    await prisma.financeEntry.delete({ where: { id: existing.id } });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete finance entry' });
  }
});

export default router;
