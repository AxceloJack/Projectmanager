import { Task, TaskStatus } from '../types/index.js';

interface ClientTaskCardProps {
  task: Task;
  onClick: () => void;
  publicKey: string;
}

const statusStyle: Record<TaskStatus, { bg: string; text: string; done?: boolean }> = {
  NOT_STARTED: { bg: '#f2f4f7', text: '#5b6470' },
  DESIGN_PHASE: { bg: '#eaf2fe', text: '#1d63b0' },
  CLIENT_REVIEW: { bg: '#fff1e2', text: '#c25e00' },
  NEEDS_REVISIONS: { bg: '#fdeaea', text: '#c0392b' },
  READY_FOR_KLAVIYO: { bg: '#e6f7ee', text: '#1f8a52', done: true },
  COMPLETE: { bg: '#f0eafc', text: '#6d43c9', done: true },
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
  const s = statusStyle[task.status];
  const label = statusLabels[task.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg px-2.5 py-1.5 shadow-sm hover:shadow-md hover:-translate-y-px transition-all cursor-pointer"
      style={{ background: s.bg }}
      title={task.title}
    >
      <span className="block truncate text-xs font-semibold text-[#17181c]">{task.title}</span>
      <span className="flex items-center gap-1 mt-0.5">
        {s.done && (
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={s.text} strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="text-[11px] font-bold truncate" style={{ color: s.text }}>
          {label}
        </span>
      </span>
    </button>
  );
}
