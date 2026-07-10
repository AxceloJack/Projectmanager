import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

interface SlackEventBody {
  token?: string;
  team_id?: string;
  enterprise_id?: string;
  api_app_id?: string;
  event?: {
    type: string;
    user?: string;
    text?: string;
  };
  type?: string;
  event_id?: string;
  event_time?: number;
  challenge?: string;
}

router.post('/events', async (req: Request, res: Response) => {
  try {
    const body = req.body as SlackEventBody;

    if (body.type === 'url_verification') {
      return res.json({ challenge: body.challenge });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process event' });
  }
});

router.post('/actions', async (req: Request, res: Response) => {
  try {
    const payload = JSON.parse(req.body.payload as string);
    const action = payload.actions?.[0];
    const responseUrl = payload.response_url as string | undefined;
    const clickedBy = payload.user?.id ? `<@${payload.user.id}>` : 'the client';

    let confirmation: string | null = null;

    if (action?.action_id === 'approve_task') {
      const task = await prisma.task.update({
        where: { id: action.value },
        data: { status: 'READY_FOR_KLAVIYO' },
      });
      confirmation = `✅ *${task.title}* approved by ${clickedBy} — moving to Klaviyo.`;
    } else if (action?.action_id === 'request_revisions') {
      const task = await prisma.task.update({
        where: { id: action.value },
        data: { status: 'NEEDS_REVISIONS' },
      });
      confirmation = `🔄 ${clickedBy} requested revisions on *${task.title}* — the team is on it.`;
    }

    if (confirmation && responseUrl) {
      // Replace the original buttons message so the click has visible
      // feedback. Must complete before res.json(): Vercel freezes the
      // function after the response is sent.
      await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replace_original: true,
          text: confirmation,
          blocks: [{ type: 'section', text: { type: 'mrkdwn', text: confirmation } }],
        }),
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

router.use(authMiddleware);

router.get('/integration', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const integration = await prisma.slackIntegration.findFirst({
      where: { workspaceId: req.user.workspaceId },
      select: {
        teamId: true,
        botToken: true,
        createdAt: true,
      },
    });

    res.json(integration || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Slack integration' });
  }
});

router.post('/workspace-connect', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { teamId, botToken } = req.body;

    const integration = await prisma.slackIntegration.upsert({
      where: {
        workspaceId_teamId: {
          workspaceId: req.user.workspaceId,
          teamId,
        },
      },
      update: { botToken },
      create: {
        workspaceId: req.user.workspaceId,
        teamId,
        botToken,
      },
    });

    res.json(integration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect Slack workspace' });
  }
});

export default router;
