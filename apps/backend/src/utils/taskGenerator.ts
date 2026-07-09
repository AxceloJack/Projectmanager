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

// Main flows in order
const FLOW_BUILD_TASKS: TaskTemplate[] = [
  { title: 'Welcome Flow', description: 'Design and build welcome flow', day: 0, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Site Abandoned Flow', description: 'Build site abandoned flow', day: 2, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Browse Abandoned Flow', description: 'Create browse abandoned flow', day: 4, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Cart/Checkout Flow', description: 'Design cart and checkout flows', day: 6, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Post Purchase Flow', description: 'Create post-purchase sequence', day: 8, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Winback Flow', description: 'Build winback/re-engagement flow', day: 10, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Sunset Flow', description: 'Create sunset/inactive user flow', day: 16, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Replenishment Flow', description: 'Design replenishment flow', day: 18, status: 'NOT_STARTED', tag: 'FLOW' },
  { title: 'Flows Ready for Klaviyo', description: 'All flows approved and ready to launch', day: 20, status: 'NOT_STARTED', tag: 'FLOW' },
];

// Soft deliverables (internal)
const SOFT_DELIVERABLES: TaskTemplate[] = [
  { title: 'Introduce Client to Application', description: 'Onboard client to Axcelo CRM', day: 0, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Create Figma Page', description: 'Set up Figma design file for project', day: 1, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Send Loom Video', description: 'Send walkthrough video to client', day: 1, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
  { title: 'Campaign Strategy', description: 'Complete campaign strategy documentation', day: 2, status: 'NOT_STARTED', tag: 'SIDE_QUEST' },
];

const FULL_EMAIL_TASKS: TaskTemplate[] = [
  ...FLOW_BUILD_TASKS,
  { title: 'Email Design Templates', description: 'Create base email templates and components', day: 12, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
  { title: 'Campaign Planning', description: 'Plan initial campaigns and cadence', day: 14, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
];

const CAMPAIGNS_ONLY_TASKS: TaskTemplate[] = [
  { title: 'Campaign Strategy', description: 'Define campaign goals and targeting', day: 2, status: 'NOT_STARTED', tag: 'CAMPAIGN' },
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

  // Always add soft deliverables
  tasks.push(...SOFT_DELIVERABLES);

  switch (serviceType) {
    case 'FLOW_ONLY':
      tasks.push(...FLOW_BUILD_TASKS);
      break;
    case 'FULL_EMAIL_MARKETING':
      tasks.push(...FULL_EMAIL_TASKS);
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
