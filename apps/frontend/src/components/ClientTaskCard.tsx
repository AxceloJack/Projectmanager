import { Task, TaskStatus } from '../types/index.js';

interface ClientTaskCardProps {
  task: Task;
  onClick: () => void;
  publicKey: string;
}

const statusColor: Record<TaskStatus, string> = {
  NOT_STARTED: '#9aa6b8',
  DESIGN_PHASE: '#3b82c4',
  CLIENT_REVIEW: '#fe7300',
  NEEDS_REVISIONS: '#d9534f',
  READY_FOR_KLAVIYO: '#3f9d54',
  COMPLETE: '#7b6bc4',
};

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not started',
  DESIGN_PHASE: 'Design',
  CLIENT_REVIEW: 'Review',
  NEEDS_REVISIONS: 'Revisions',
  READY_FOR_KLAVIYO: 'Ready',
  COMPLETE: 'Complete',
};

export default function ClientTaskCard({ task, onClick }: ClientTaskCardProps) {
  const color = statusColor[task.status];
  const label = statusLabels[task.status];

  return (
    <button
      onClick={onClick}
      className="neu-raised-sm w-full text-left px-2.5 py-2 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
      title={task.title}
    >
      <span className="block truncate text-xs font-semibold text-[#474747]">{task.title}</span>
      <span className="flex items-center gap-1.5 mt-1">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-[11px] font-medium truncate" style={{ color }}>
          {label}
        </span>
      </span>
    </button>
  );
}
