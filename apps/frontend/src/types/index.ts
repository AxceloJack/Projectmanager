export type TaskStatus = 'NOT_STARTED' | 'DESIGN_PHASE' | 'CLIENT_REVIEW' | 'NEEDS_REVISIONS' | 'READY_FOR_KLAVIYO' | 'COMPLETE';
export type TaskTag = 'SIDE_QUEST' | 'FLOW' | 'CAMPAIGN';

export interface User {
  id: string;
  email: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  publicKey: string;
  workspaceId: string;
  createdAt: string;
  tasks?: Task[];
  serviceType?: string;
  kickOffDate?: string;
  klaviyoBillingDate?: string;
  slackId?: string;
  slackUserId?: string;
  klaviyoApi?: string;
  figmaLink?: string;
}

export interface Task {
  id: string;
  clientId: string;
  client?: Client;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  tag: TaskTag;
  assigneeId?: string;
  assignee?: User;
  figmaLink?: string;
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface FinanceEntry {
  id: string;
  workspaceId: string;
  date: string;
  description: string;
  category?: string | null;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  status: 'PAID' | 'PENDING';
  notes?: string | null;
  createdAt: string;
}

export type FormType = 'CAMPAIGN' | 'ONBOARDING';

export interface CampaignForm {
  id: string;
  clientId: string;
  client?: { id: string; name: string };
  type: FormType;
  month?: string | null;
  publicKey: string;
  status: 'PENDING' | 'SUBMITTED';
  // Campaign answers
  sales?: string | null;
  launches?: string | null;
  specialDates?: string | null;
  avoidances?: string | null;
  notes?: string | null;
  // Onboarding answers
  brandOverview?: string | null;
  targetAudience?: string | null;
  brandVoice?: string | null;
  goals?: string | null;
  currentSetup?: string | null;
  keyProducts?: string | null;
  links?: string | null;
  inspiration?: string | null;
  submittedAt?: string | null;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  currency?: string;
}

export interface AuthResponse {
  token: string;
  workspace: Workspace;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  startDate: string;
  sendDate?: string;
  status: string;
  metrics?: any;
}

export interface ABTest {
  id: string;
  campaignId: string;
  name: string;
  variantA: string;
  variantB: string;
  winner?: string;
  results?: any;
}
