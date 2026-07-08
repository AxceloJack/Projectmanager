import { PrismaClient } from '@prisma/client';

type ServiceType = 'FLOW_ONLY' | 'FULL_EMAIL_MARKETING' | 'CAMPAIGNS_ONLY';

interface TaskTemplate {
  title: string;
  description: string;
  day: number; // Day of the 21-day timeline
  status: string;
}

const FLOW_BUILD_TASKS: TaskTemplate[] = [
  // Week 1
  { title: 'Welcome Flow', description: 'Design and build welcome flow', day: 2, status: 'NOT_STARTED' },
  { title: 'Site Flow', description: 'Create site flow', day: 3, status: 'NOT_STARTED' },
  { title: 'Browse Flow', description: 'Build browse flow', day: 4, status: 'NOT_STARTED' },

  // Week 2
  { title: 'Cart/Checkout Flow', description: 'Design cart and checkout flows', day: 7, status: 'NOT_STARTED' },
  { title: 'Post Purchase Flow', description: 'Create post-purchase sequence', day: 9, status: 'NOT_STARTED' },
  { title: 'Winback Flow', description: 'Build winback/re-engagement flow', day: 10, status: 'NOT_STARTED' },

  // Week 3
  { title: 'Replenishment Flow', description: 'Design replenishment flow', day: 14, status: 'NOT_STARTED' },
  { title: 'Sunset Flow', description: 'Create sunset/inactive user flow', day: 15, status: 'NOT_STARTED' },
  { title: 'All Flows Client Review', description: 'Present all flows to client for review', day: 17, status: 'NOT_STARTED' },
  { title: 'Flows Ready for Klaviyo', description: 'All flows approved and ready to launch', day: 21, status: 'NOT_STARTED' },
];

const FULL_EMAIL_TASKS: TaskTemplate[] = [
  ...FLOW_BUILD_TASKS,
  // Additional email marketing tasks
  { title: 'Email Design Templates', description: 'Create base email templates and components', day: 18, status: 'NOT_STARTED' },
  { title: 'Campaign Planning', description: 'Plan initial campaigns and cadence', day: 19, status: 'NOT_STARTED' },
];

const CAMPAIGNS_ONLY_TASKS: TaskTemplate[] = [
  { title: 'Campaign Strategy', description: 'Define campaign goals and targeting', day: 2, status: 'NOT_STARTED' },
  { title: 'Campaign Design', description: 'Create campaign email designs', day: 5, status: 'NOT_STARTED' },
  { title: 'Campaign Setup', description: 'Set up campaigns in Klaviyo', day: 10, status: 'NOT_STARTED' },
  { title: 'Campaign Review', description: 'Client review of campaigns', day: 15, status: 'NOT_STARTED' },
  { title: 'Campaign Launch Ready', description: 'Campaigns ready to send', day: 21, status: 'NOT_STARTED' },
];

export async function generateTimelineTasks(
  prisma: PrismaClient,
  clientId: string,
  serviceType: ServiceType,
  kickOffDate: Date
) {
  let tasks: TaskTemplate[] = [];

  switch (serviceType) {
    case 'FLOW_ONLY':
      tasks = FLOW_BUILD_TASKS;
      break;
    case 'FULL_EMAIL_MARKETING':
      tasks = FULL_EMAIL_TASKS;
      break;
    case 'CAMPAIGNS_ONLY':
      tasks = CAMPAIGNS_ONLY_TASKS;
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
      },
    });

    createdTasks.push(task);
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
