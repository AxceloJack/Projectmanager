import { PrismaClient } from '@prisma/client';

type ServiceType = 'FLOW_ONLY' | 'FULL_EMAIL_MARKETING' | 'CAMPAIGNS_ONLY';
type TaskTag = 'FLOW' | 'CAMPAIGN' | 'SIDE_QUEST';

interface TaskTemplate {
  title: string;
  description: string;
  day: number; // Day of the 21-day timeline
  status: string;
  tag: TaskTag;
}

// Main flows in order - spaced across 21 days starting Day 3
const FLOW_BUILD_TASKS: TaskTemplate[] = [
  { title: 'Welcome Flow', description: 'Design and build welcome flow', day: 3, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Site Abandoned Flow', description: 'Build site abandoned flow', day: 5, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Browse Abandoned Flow', description: 'Create browse abandoned flow', day: 7, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Cart/Checkout Flow', description: 'Design cart and checkout flows', day: 10, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Post Purchase Flow', description: 'Create post-purchase sequence', day: 13, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Winback Flow', description: 'Build winback/re-engagement flow', day: 15, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Sunset Flow', description: 'Create sunset/inactive user flow', day: 18, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Replenishment Flow', description: 'Design replenishment flow', day: 20, status: 'NOT_STARTED', tag: 'FLOW' },
];

// Internal onboarding side quests — added for every client.
// day is a 0-indexed offset from the kick-off date, so day 0 = "Day 1".
const ONBOARDING_SIDE_QUESTS: TaskTemplate[] = [
  { title: 'Introduce Client to Axcelo App', description: 'Walk the client through the Axcelo app and give them access', day: 0, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Create Figma Page', description: 'Set up the Figma design file for the project', day: 0, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Core Segments Inside Klaviyo', description: 'Build the core segments inside Klaviyo', day: 4, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Report on GlockApps', description: 'Run the GlockApps deliverability test and report findings', day: 5, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
];

// Flow-building services only (Full Email Marketing + Flow Build Only)
const FLOW_DIAGRAM_SIDE_QUESTS: TaskTemplate[] = [
  { title: 'Report on Flow Diagram', description: 'Deliver the flow diagram report to the client', day: 2, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
];

// Campaign services only (Full Email Marketing + Campaigns Only)
const CAMPAIGN_PLANNING_SIDE_QUESTS: TaskTemplate[] = [
  { title: 'Campaign Strategy', description: 'Complete the campaign strategy documentation', day: 1, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Campaign Planning', description: 'Plan the initial campaigns and cadence', day: 1, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
];

const CAMPAIGNS_ONLY_TASKS: TaskTemplate[] = [
  { title: 'Campaign Design', description: 'Create campaign email designs', day: 5, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
  { title: 'Campaign Setup', description: 'Set up campaigns in Klaviyo', day: 10, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
  { title: 'Campaign Review', description: 'Client review of campaigns', day: 15, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
  { title: 'Campaign Launch Ready', description: 'Campaigns ready to send', day: 20, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
];

export async function generateTimelineTasks(
  prisma: PrismaClient,
  clientId: string,
  serviceType: ServiceType,
  kickOffDate: Date,
  klaviyoBillingDate?: Date
) {
  let tasks: TaskTemplate[] = [];

  const buildsFlows =
    serviceType === 'FULL_EMAIL_MARKETING' || serviceType === 'FLOW_ONLY';
  const runsCampaigns =
    serviceType === 'FULL_EMAIL_MARKETING' || serviceType === 'CAMPAIGNS_ONLY';

  // Onboarding side quests for every client
  tasks.push(...ONBOARDING_SIDE_QUESTS);

  // Flow diagram report only for services that build flows
  if (buildsFlows) {
    tasks.push(...FLOW_DIAGRAM_SIDE_QUESTS);
  }

  // Campaign strategy + planning only for services that run campaigns
  if (runsCampaigns) {
    tasks.push(...CAMPAIGN_PLANNING_SIDE_QUESTS);
  }

  switch (serviceType) {
    case 'FLOW_ONLY':
      tasks.push(...FLOW_BUILD_TASKS);
      break;
    case 'FULL_EMAIL_MARKETING':
      tasks.push(...FLOW_BUILD_TASKS);
      break;
    case 'CAMPAIGNS_ONLY':
      tasks.push(...CAMPAIGNS_ONLY_TASKS);
      break;
  }

  const createdTasks = [];

  for (const taskTemplate of tasks) {
    const dueDate = new Date(kickOffDate);
    dueDate.setDate(dueDate.getDate() + taskTemplate.day);

    const task = await prisma.task.create({
      data: {
        clientId,
        title: taskTemplate.title,
        description: taskTemplate.description,
        dueDate,
        status: taskTemplate.status,
        tag: taskTemplate.tag,
      },
    });

    createdTasks.push(task);
  }

  // Add recurring check-in calls every 30 days
  for (let i = 1; i <= 2; i++) {
    const checkInDate = new Date(kickOffDate);
    checkInDate.setDate(checkInDate.getDate() + (30 * i));

    const checkInTask = await prisma.task.create({
      data: {
        clientId,
        title: `Check-in Call`,
        description: `Monthly check-in call with client`,
        dueDate: checkInDate,
        status: 'NOT_STARTED',
        tag: 'SIDE_QUEST',
      },
    });

    createdTasks.push(checkInTask);
  }

  // Add Klaviyo cleanup task 1 day before billing date if provided
  if (klaviyoBillingDate) {
    const cleanupDate = new Date(klaviyoBillingDate);
    cleanupDate.setDate(cleanupDate.getDate() - 1);

    const cleanupTask = await prisma.task.create({
      data: {
        clientId,
        title: 'Clean Up Klaviyo List',
        description: 'Review and clean up Klaviyo list before billing',
        dueDate: cleanupDate,
        status: 'NOT_STARTED',
        tag: 'SIDE_QUEST',
      },
    });

    createdTasks.push(cleanupTask);
  }

  return createdTasks;
}

export function getServiceTypeLabel(serviceType: string): string {
  const labels: Record<string, string> = {
    FLOW_ONLY: 'Flow Build Only',
    FULL_EMAIL_MARKETING: 'Full Email Marketing',
    CAMPAIGNS_ONLY: 'Campaigns Only',
  };
  return labels[serviceType] || 'Unknown';
}
