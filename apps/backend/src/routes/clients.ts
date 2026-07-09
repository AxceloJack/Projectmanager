import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { generateTimelineTasks, getServiceTypeLabel } from '../utils/taskGenerator.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

interface CreateClientBody {
  name: string;
  email?: string;
  serviceType?: string;
  kickOffDate?: string;
  klaviyoBillingDate?: string;
  slackId?: string;
  slackUserId?: string;
  klaviyoApi?: string;
  figmaLink?: string;
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

    const {
      name,
      email,
      serviceType = 'FLOW_ONLY',
      kickOffDate,
      klaviyoBillingDate,
      slackId,
      slackUserId,
      klaviyoApi,
      figmaLink,
    } = req.body as CreateClientBody;

    const client = await prisma.client.create({
      data: {
        workspaceId: req.user.workspaceId,
        name,
        email,
        serviceType,
        kickOffDate: kickOffDate ? new Date(kickOffDate) : null,
        klaviyoBillingDate: klaviyoBillingDate ? new Date(klaviyoBillingDate) : null,
        slackId,
        slackUserId,
        klaviyoApi,
        figmaLink,
      },
    });

    // Generate timeline tasks if kickOffDate is provided
    if (kickOffDate) {
      await generateTimelineTasks(
        prisma,
        client.id,
        serviceType as 'FLOW_ONLY' | 'FULL_EMAIL_MARKETING' | 'CAMPAIGNS_ONLY',
        new Date(kickOffDate),
        klaviyoBillingDate ? new Date(klaviyoBillingDate) : undefined
      );
    }

    const updatedClient = await prisma.client.findUnique({
      where: { id: client.id },
      include: {
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    res.status(201).json(updatedClient);
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

    const {
      name,
      email,
      serviceType,
      kickOffDate,
      klaviyoBillingDate,
      slackId,
      slackUserId,
      klaviyoApi,
      figmaLink,
    } = req.body as CreateClientBody;

    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        workspaceId: req.user.workspaceId,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // If kickOffDate is being set for the first time and tasks don't exist, generate them
    const hasExistingTasks = await prisma.task.findFirst({
      where: { clientId: req.params.id },
    });

    const updatedClient = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(serviceType && { serviceType }),
        ...(kickOffDate && { kickOffDate: new Date(kickOffDate) }),
        ...(klaviyoBillingDate !== undefined && { klaviyoBillingDate: klaviyoBillingDate ? new Date(klaviyoBillingDate) : null }),
        ...(slackId !== undefined && { slackId }),
        ...(slackUserId !== undefined && { slackUserId }),
        ...(klaviyoApi !== undefined && { klaviyoApi }),
        ...(figmaLink !== undefined && { figmaLink }),
      },
      include: {
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    // Generate tasks if kickOffDate is being set and no tasks exist
    if (kickOffDate && !hasExistingTasks) {
      await generateTimelineTasks(
        prisma,
        req.params.id,
        serviceType as 'FLOW_ONLY' | 'FULL_EMAIL_MARKETING' | 'CAMPAIGNS_ONLY',
        new Date(kickOffDate),
        klaviyoBillingDate ? new Date(klaviyoBillingDate) : undefined
      );
    }

    res.json(updatedClient);
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
