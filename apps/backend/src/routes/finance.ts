import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { getRates, getFrozenRate } from '../utils/fxRates.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const VALID_CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD'];
const VALID_FREQUENCIES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const entries = await prisma.financeEntry.findMany({
      where: { workspaceId: req.user.workspaceId },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    const workspace = await prisma.workspace.findUnique({
      where: { id: req.user.workspaceId },
      select: { currency: true },
    });

    const base = workspace?.currency || 'GBP';
    const fx = await getRates(base);

    res.json({ entries, currency: base, fx });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch finance entries' });
  }
});

function parseEntryBody(body: any) {
  const recurring = !!body.recurring;
  const frequency =
    recurring && VALID_FREQUENCIES.includes(body.frequency) ? body.frequency : null;
  return {
    date: body.date ? new Date(body.date) : undefined,
    description: body.description,
    category: body.category || null,
    type: body.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: body.amount !== undefined ? Number(body.amount) : undefined,
    currency: VALID_CURRENCIES.includes(body.currency) ? body.currency : 'GBP',
    status: body.status === 'PENDING' ? 'PENDING' : 'PAID',
    recurring,
    frequency,
    endDate: recurring && body.endDate ? new Date(body.endDate) : null,
    notes: body.notes || null,
    clientId: body.clientId || null,
  };
}

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { date, description, amount, clientId } = req.body;
    if (!description || amount === undefined || amount === null || !date) {
      return res.status(400).json({ error: 'Date, description and amount are required' });
    }

    // Guard the optional client link to this workspace.
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, workspaceId: req.user.workspaceId },
      });
      if (!client) return res.status(400).json({ error: 'Invalid client' });
    }

    const data = parseEntryBody(req.body);
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.user.workspaceId },
      select: { currency: true },
    });
    const base = workspace?.currency || 'GBP';
    const fxRate = await getFrozenRate(data.currency, base, data.date!);

    const entry = await prisma.financeEntry.create({
      data: {
        ...data,
        date: data.date!,
        amount: data.amount!,
        workspaceId: req.user.workspaceId,
        fxRate,
        fxBase: base,
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

    // Re-freeze every entry against the new base so historical values
    // stay correct instead of falling back to live conversion.
    const entries = await prisma.financeEntry.findMany({
      where: { workspaceId: req.user.workspaceId },
      select: { id: true, currency: true, date: true },
    });
    for (const e of entries) {
      const fxRate = await getFrozenRate(e.currency, currency, e.date);
      await prisma.financeEntry.update({
        where: { id: e.id },
        data: { fxRate, fxBase: currency },
      });
    }

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

    if (req.body.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: req.body.clientId, workspaceId: req.user.workspaceId },
      });
      if (!client) return res.status(400).json({ error: 'Invalid client' });
    }

    const data = parseEntryBody(req.body);
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.user.workspaceId },
      select: { currency: true },
    });
    const base = workspace?.currency || 'GBP';
    // Re-freeze in case amount, currency or date changed.
    const fxRate = await getFrozenRate(data.currency, base, data.date ?? existing.date);

    const entry = await prisma.financeEntry.update({
      where: { id: existing.id },
      data: { ...data, fxRate, fxBase: base },
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
