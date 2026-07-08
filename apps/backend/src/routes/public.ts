import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/clients/:publicKey', async (req, res: Response) => {
  try {
    const { publicKey } = req.params;

    const client = await prisma.client.findUnique({
      where: { publicKey },
      include: {
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: {
            comments: {
              include: { user: { select: { id: true, email: true } } },
              orderBy: { createdAt: 'desc' },
            },
          },
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

router.post('/clients/:publicKey/comments', async (req, res: Response) => {
  try {
    const { publicKey } = req.params;
    const { taskId, content, clientName } = req.body;

    const client = await prisma.client.findUnique({
      where: { publicKey },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        clientId: client.id,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: '', // Placeholder - we'll track client name in content
        content: `[${clientName}]: ${content}`,
      },
      include: { user: true },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/clients/:publicKey/tasks/:taskId/approve', async (req, res: Response) => {
  try {
    const { publicKey, taskId } = req.params;

    const client = await prisma.client.findUnique({
      where: { publicKey },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'READY_FOR_KLAVIYO' },
      include: { comments: true },
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve task' });
  }
});

router.post('/clients/:publicKey/tasks/:taskId/request-revisions', async (req, res: Response) => {
  try {
    const { publicKey, taskId } = req.params;
    const { reason } = req.body;

    const client = await prisma.client.findUnique({
      where: { publicKey },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'NEEDS_REVISIONS' },
      include: { comments: true },
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request revisions' });
  }
});

export default router;
