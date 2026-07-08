import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';

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
    const { actions, team, trigger_id } = payload;

    if (actions?.[0]?.action_id === 'approve_task') {
      const taskId = actions[0].value;
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'READY_FOR_KLAVIYO' },
      });
    } else if (actions?.[0]?.action_id === 'request_revisions') {
      const taskId = actions[0].value;
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'NEEDS_REVISIONS' },
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process action' });
  }
});

router.post('/workspace-connect', async (req: Request, res: Response) => {
  try {
    const { workspaceId, teamId, botToken, channelId } = req.body;

    const integration = await prisma.slackIntegration.upsert({
      where: {
        workspaceId_teamId: {
          workspaceId,
          teamId,
        },
      },
      update: { botToken, channelId },
      create: { workspaceId, teamId, botToken, channelId },
    });

    res.json(integration);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to connect Slack workspace' });
  }
});

export default router;
