import { Task, TaskStatus, TaskTag } from '../types/index.js';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const statusColors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  NOT_STARTED: { bg: 'bg-gray-800/40', text: 'text-gray-300', border: 'border-gray-700' },
  DESIGN_PHASE: { bg: 'bg-blue-900/40', text: 'text-blue-300', border: 'border-blue-700/50' },
  CLIENT_REVIEW: { bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-700/50' },
  NEEDS_REVISIONS: { bg: 'bg-red-900/40', text: 'text-red-300', border: 'border-red-700/50' },
  READY_FOR_KLAVIYO: { bg: 'bg-green-900/40', text: 'text-green-300', border: 'border-green-700/50' },
  COMPLETE: { bg: 'bg-purple-900/40', text: 'text-purple-300', border: 'border-purple-700/50' },
};

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  DESIGN_PHASE: 'Design',
  CLIENT_REVIEW: 'Review',
  NEEDS_REVISIONS: 'Revisions',
  READY_FOR_KLAVIYO: 'Ready',
  COMPLETE: 'Complete',
};

const statusIcons: Record<TaskStatus, string> = {
  NOT_STARTED: '○',
  DESIGN_PHASE: '✏️',
  CLIENT_REVIEW: '👁️',
  NEEDS_REVISIONS: '🔄',
  READY_FOR_KLAVIYO: '✓',
  COMPLETE: '✓✓',
};

const tagColors: Record<TaskTag, { bg: string; text: string }> = {
  FLOW: { bg: 'bg-cyan-900/50', text: 'text-cyan-200' },
  CAMPAIGN: { bg: 'bg-indigo-900/50', text: 'text-indigo-200' },
  SIDE_QUEST: { bg: 'bg-amber-900/50', text: 'text-amber-200' },
};

const tagLabels: Record<TaskTag, string> = {
  FLOW: 'Flow',
  CAMPAIGN: 'Campaign',
  SIDE_QUEST: 'Side Quest',
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const colors = statusColors[task.status];
  const label = statusLabels[task.status];
  const icon = statusIcons[task.status];
  const tagColor = tagColors[task.tag];
  const tagLabel = tagLabels[task.tag];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1.5 rounded border transition-all hover:scale-105 hover:shadow-lg cursor-pointer group ${colors.bg} ${colors.text} ${colors.border} border`}
      title={task.title}
    >
      <div className="flex items-start gap-1.5">
        <span className="text-xs mt-0.5 flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-xs font-semibold truncate group-hover:text-white transition flex-1">{task.title}</div>
            <div className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${tagColor.bg} ${tagColor.text}`}>
              {tagLabel}
            </div>
          </div>
          <div className="text-xs opacity-70 mt-0.5">{label}</div>
        </div>
      </div>
    </button>
  );
}
