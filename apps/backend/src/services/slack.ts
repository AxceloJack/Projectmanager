import { WebClient } from '@slack/web-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function notifyTaskClientReview(taskId: string, workspaceId: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { client: true },
    });

    if (!task) {
      console.error(`Task ${taskId} not found`);
      return;
    }

    const integration = await prisma.slackIntegration.findFirst({
      where: { workspaceId },
    });

    if (!integration || !integration.botToken) {
      console.log(`No Slack integration configured for workspace ${workspaceId}`);
      return;
    }

    if (!task.client.slackId) {
      console.log(`No Slack channel configured for client ${task.client.name}`);
      return;
    }

    const client = new WebClient(integration.botToken);

    const userTag = task.client.slackUserId ? `<@${task.client.slackUserId}>` : task.client.name;
    const figmaLink = task.figmaLink || task.client.figmaLink;
    const figmaSection = figmaLink
      ? {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<${figmaLink}|View Figma Design>`,
          },
        }
      : null;

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${userTag} - Your *${task.title}* is ready for review`,
        },
      },
      ...(figmaSection ? [figmaSection] : []),
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '✅ Approve',
              emoji: true,
            },
            value: taskId,
            action_id: 'approve_task',
            style: 'primary',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🔄 Needs Revision',
              emoji: true,
            },
            value: taskId,
            action_id: 'request_revisions',
            style: 'danger',
          },
        ],
      },
    ];

    const message = {
      channel: task.client.slackId,
      text: `${task.client.name} - ${task.title} is ready for review`,
      blocks: blocks.filter(Boolean),
    };

    await client.chat.postMessage(message as any);
    console.log(`✅ Slack notification sent for task ${taskId}`);
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}
