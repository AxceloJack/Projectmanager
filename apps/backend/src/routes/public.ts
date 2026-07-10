import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/forms/:publicKey', async (req, res: Response) => {
  try {
    const form = await prisma.campaignForm.findUnique({
      where: { publicKey: req.params.publicKey },
      include: { client: { select: { name: true } } },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({
      clientName: form.client.name,
      type: form.type,
      month: form.month,
      status: form.status,
      // Campaign answers
      sales: form.sales,
      launches: form.launches,
      specialDates: form.specialDates,
      avoidances: form.avoidances,
      notes: form.notes,
      // Onboarding answers
      brandOverview: form.brandOverview,
      targetAudience: form.targetAudience,
      brandVoice: form.brandVoice,
      goals: form.goals,
      currentSetup: form.currentSetup,
      keyProducts: form.keyProducts,
      links: form.links,
      inspiration: form.inspiration,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

router.post('/forms/:publicKey', async (req, res: Response) => {
  try {
    const form = await prisma.campaignForm.findUnique({
      where: { publicKey: req.params.publicKey },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const b = req.body as Record<string, string | undefined>;
    const clean = (v?: string) => v || null;

    await prisma.campaignForm.update({
      where: { id: form.id },
      data: {
        // Campaign answers
        sales: clean(b.sales),
        launches: clean(b.launches),
        specialDates: clean(b.specialDates),
        avoidances: clean(b.avoidances),
        notes: clean(b.notes),
        // Onboarding answers
        brandOverview: clean(b.brandOverview),
        targetAudience: clean(b.targetAudience),
        brandVoice: clean(b.brandVoice),
        goals: clean(b.goals),
        currentSetup: clean(b.currentSetup),
        keyProducts: clean(b.keyProducts),
        links: clean(b.links),
        inspiration: clean(b.inspiration),
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

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

router.patch('/clients/:publicKey/tasks/:taskId', async (req, res: Response) => {
  try {
    const { publicKey, taskId } = req.params;
    const { status } = req.body;

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

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        comments: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
