import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { notifyTaskClientReview } from '../services/slack.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

type TaskStatus = 'NOT_STARTED' | 'DESIGN_PHASE' | 'CLIENT_REVIEW' | 'NEEDS_REVISIONS' | 'READY_FOR_KLAVIYO' | 'COMPLETE';

interface CreateTaskBody {
  clientId: string;
  title: string;
  description?: string;
  dueDate: string;
  tag?: string;
  figmaLink?: string;
  assigneeId?: string;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  tag?: string;
  figmaLink?: string;
  assigneeId?: string;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { clientId } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        client: { workspaceId: req.user.workspaceId },
        ...(clientId && { clientId: clientId as string }),
      },
      include: {
        client: true,
        assignee: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { clientId, title, description, dueDate, tag = 'FLOW', figmaLink, assigneeId } = req.body as CreateTaskBody;

    const client = await prisma.client.findFirst({
      where: { id: clientId, workspaceId: req.user.workspaceId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const task = await prisma.task.create({
      data: {
        clientId,
        title,
        description,
        dueDate: new Date(dueDate),
        tag,
        figmaLink,
        assigneeId,
      },
      include: {
        client: true,
        assignee: true,
        comments: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        client: { workspaceId: req.user.workspaceId },
      },
      include: {
        client: true,
        assignee: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { title, description, dueDate, status, tag, figmaLink, assigneeId } = req.body as UpdateTaskBody;

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        client: { workspaceId: req.user.workspaceId },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        tag,
        figmaLink,
        assigneeId,
      },
      include: {
        client: true,
        assignee: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (status === 'CLIENT_REVIEW') {
      // Must complete before the response is sent: Vercel freezes the
      // function after res.json(), which kills in-flight requests.
      await notifyTaskClientReview(req.params.id, req.user.workspaceId);
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.post('/:id/comments', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { content } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        client: { workspaceId: req.user.workspaceId },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: req.params.id,
        userId: req.user.userId,
        content,
      },
      include: { user: true },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        client: { workspaceId: req.user.workspaceId },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
