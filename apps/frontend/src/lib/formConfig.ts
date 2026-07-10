import { FormType } from '../types/index.js';

export interface FormQuestion {
  key: string;
  label: string;
  hint: string;
}

export interface FormConfig {
  type: FormType;
  tabLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  hasMonth: boolean;
  // Public form page copy
  publicIntro: (subject: string) => string;
  questions: FormQuestion[];
}

const CAMPAIGN_QUESTIONS: FormQuestion[] = [
  {
    key: 'sales',
    label: 'Are there any sales or promotions planned?',
    hint: 'Dates, discount amounts, which products — anything you know so far.',
  },
  {
    key: 'launches',
    label: 'Any product launches or new arrivals?',
    hint: 'New products, restocks, or collections dropping this month.',
  },
  {
    key: 'specialDates',
    label: 'Any special dates or events we should plan around?',
    hint: 'Brand anniversaries, holidays you care about, events, collabs.',
  },
  {
    key: 'avoidances',
    label: 'Anything we should avoid?',
    hint: 'Dates not to send on, topics or angles to steer clear of.',
  },
  {
    key: 'notes',
    label: 'Anything else on your mind for this month?',
    hint: 'Goals, ideas, feedback — whatever you want us to know.',
  },
];

const ONBOARDING_QUESTIONS: FormQuestion[] = [
  {
    key: 'brandOverview',
    label: 'Tell us about your brand',
    hint: 'What you sell, your story, and what makes you different.',
  },
  {
    key: 'targetAudience',
    label: "Who's your ideal customer?",
    hint: 'Age, lifestyle, what they care about — paint us a picture.',
  },
  {
    key: 'brandVoice',
    label: 'How would you describe your brand voice & tone?',
    hint: 'Playful, luxury, bold, minimal? Any words you love or hate.',
  },
  {
    key: 'goals',
    label: 'What are your goals for email marketing?',
    hint: 'Revenue targets, retention, launches — what does success look like?',
  },
  {
    key: 'currentSetup',
    label: "What's your current email setup?",
    hint: 'Which platform (Klaviyo etc.), rough list size, what’s running now.',
  },
  {
    key: 'keyProducts',
    label: 'What are your hero or bestselling products?',
    hint: 'The products you most want us to push.',
  },
  {
    key: 'links',
    label: 'Share your key links',
    hint: 'Website, Instagram, brand assets, style guides — drop them all here.',
  },
  {
    key: 'inspiration',
    label: 'Any brands you love or want to emulate?',
    hint: 'Emails or brands whose style you admire.',
  },
  {
    key: 'notes',
    label: 'Anything else we should know?',
    hint: 'Anything at all that will help us get started on the right foot.',
  },
];

export const CAMPAIGN_CONFIG: FormConfig = {
  type: 'CAMPAIGN',
  tabLabel: 'Campaign Forms',
  pageTitle: 'Campaign Forms',
  pageSubtitle: 'Send clients a strategy form for the month ahead • Sales, launches, key dates',
  hasMonth: true,
  publicIntro: (month) =>
    `Help us plan your email campaigns for ${month}. Fill in whatever applies — skip anything that doesn't.`,
  questions: CAMPAIGN_QUESTIONS,
};

export const ONBOARDING_CONFIG: FormConfig = {
  type: 'ONBOARDING',
  tabLabel: 'Onboarding',
  pageTitle: 'Onboarding Forms',
  pageSubtitle: 'Send new clients a welcome form when they first sign on • Brand, audience, goals',
  hasMonth: false,
  publicIntro: () =>
    "Welcome aboard! Tell us about your brand so we can hit the ground running. Fill in whatever applies — skip anything that doesn't.",
  questions: ONBOARDING_QUESTIONS,
};

export const FORM_CONFIGS: Record<FormType, FormConfig> = {
  CAMPAIGN: CAMPAIGN_CONFIG,
  ONBOARDING: ONBOARDING_CONFIG,
};
