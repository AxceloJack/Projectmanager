import { Task, TaskStatus } from '../types/index.js';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const statusStyle: Record<TaskStatus, { bar: string; bg: string; text: string; done?: boolean }> = {
  NOT_STARTED: { bar: '#8892a4', bg: '#f2f4f7', text: '#5b6470' },
  DESIGN_PHASE: { bar: '#2f80ed', bg: '#eaf2fe', text: '#1d63b0' },
  CLIENT_REVIEW: { bar: '#fe7300', bg: '#fff1e2', text: '#c25e00' },
  NEEDS_REVISIONS: { bar: '#e5484d', bg: '#fdeaea', text: '#c0392b' },
  READY_FOR_KLAVIYO: { bar: '#2fa96b', bg: '#e6f7ee', text: '#1f8a52', done: true },
  COMPLETE: { bar: '#8b5cf6', bg: '#f0eafc', text: '#6d43c9', done: true },
};

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not started',
  DESIGN_PHASE: 'Design',
  CLIENT_REVIEW: 'Review',
  NEEDS_REVISIONS: 'Revisions',
  READY_FOR_KLAVIYO: 'Ready',
  COMPLETE: 'Complete',
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const s = statusStyle[task.status];
  const label = statusLabels[task.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg pl-2.5 pr-2 py-1.5 shadow-sm hover:shadow-md hover:-translate-y-px transition-all cursor-pointer"
      style={{ background: s.bg, borderLeft: `3px solid ${s.bar}` }}
      title={task.title}
    >
      <div className="text-xs font-semibold text-[#17181c] truncate">{task.title}</div>
      <div className="flex items-center gap-1 mt-0.5">
        {s.done && (
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={s.text} strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <span className="text-[11px] font-bold truncate" style={{ color: s.text }}>
          {label}
        </span>
      </div>
    </button>
  );
}
