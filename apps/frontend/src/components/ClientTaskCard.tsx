import { Task, TaskStatus } from '../types/index.js';

interface ClientTaskCardProps {
  task: Task;
  onClick: () => void;
  publicKey: string;
}

const statusColors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  NOT_STARTED: { bg: 'bg-gray-900', text: 'text-gray-300', border: 'border-gray-800' },
  DESIGN_PHASE: { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-800' },
  CLIENT_REVIEW: { bg: 'bg-orange-950', text: 'text-orange-300', border: 'border-orange-800' },
  NEEDS_REVISIONS: { bg: 'bg-red-950', text: 'text-red-300', border: 'border-red-800' },
  READY_FOR_KLAVIYO: { bg: 'bg-green-950', text: 'text-green-300', border: 'border-green-800' },
  COMPLETE: { bg: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-800' },
};

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  DESIGN_PHASE: 'Design',
  CLIENT_REVIEW: 'Review',
  NEEDS_REVISIONS: 'Revisions',
  READY_FOR_KLAVIYO: 'Ready',
  COMPLETE: 'Complete',
};

export default function ClientTaskCard({
  task,
  onClick,
  publicKey,
}: ClientTaskCardProps) {
  const colors = statusColors[task.status];
  const label = statusLabels[task.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1 rounded border text-xs font-medium truncate transition-all hover:shadow-md cursor-pointer ${colors.bg} ${colors.text} ${colors.border}`}
      title={task.title}
    >
      <span className="block truncate">{task.title}</span>
      <span className="text-xs opacity-70">{label}</span>
    </button>
  );
}
