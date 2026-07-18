import { useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Client, Task } from '../types/index.js';
import ClientTaskCard from './ClientTaskCard.js';

interface ClientCalendarProps {
  client: Client;
  publicKey: string;
  onTaskUpdate?: () => void;
}

export default function ClientCalendar({ client, publicKey, onTaskUpdate }: ClientCalendarProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter to only show FLOW and CAMPAIGN tasks (hide SIDE_QUEST)
  const visibleTasks = (client.tasks || []).filter((task) => task.tag === 'FLOW' || task.tag === 'CAMPAIGN');
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Show all 7 days of the week
  const allDays = Array(days[0].getDay())
    .fill(null)
    .concat(days);
  const calendarDays = allDays;

  const getDayTasks = (date: Date) => {
    return visibleTasks.filter(
      (task) =>
        format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="neu-pressable px-4 py-2 text-[#17181c] rounded-xl font-semibold"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-bold text-[#17181c]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="neu-pressable px-4 py-2 text-[#17181c] rounded-xl font-semibold"
        >
          Next →
        </button>
      </div>

      <div className="neu-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b border-[#eceef2]">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-4 py-3 font-semibold text-[#626875] text-center text-sm uppercase tracking-wide border-r border-[#eceef2] last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-32 p-3 border-r border-b border-[#eceef2] last:border-r-0 transition ${
                day && isSameMonth(day, currentMonth) ? 'bg-transparent hover:bg-[#eef0f3]' : 'bg-[#f5f6f8]'
              }`}
            >
              {day && (
                <>
                  <div className={`font-semibold text-sm mb-2 ${isSameMonth(day, currentMonth) ? 'text-[#17181c]' : 'text-[#c0c5cf]'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {getDayTasks(day).map((task) => (
                      <ClientTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        publicKey={publicKey}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <ClientTaskDetail
          task={selectedTask}
          publicKey={publicKey}
          clientFigmaLink={client.figmaLink}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={onTaskUpdate}
        />
      )}
    </div>
  );
}

function ClientTaskDetail({
  task,
  publicKey,
  clientFigmaLink,
  onClose,
  onTaskUpdate,
}: {
  task: Task;
  publicKey: string;
  clientFigmaLink?: string;
  onClose: () => void;
  onTaskUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tasks without their own Figma link fall back to the client's board.
  const figmaLink = task.figmaLink || clientFigmaLink;

  const statusColors: Record<string, string> = {
    NOT_STARTED: 'pill-gray',
    DESIGN_PHASE: 'pill-blue',
    CLIENT_REVIEW: 'pill-orange',
    NEEDS_REVISIONS: 'pill-red',
    READY_FOR_KLAVIYO: 'pill-green',
    COMPLETE: 'pill-purple',
  };

  const handleApprove = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/clients/${publicKey}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'READY_FOR_KLAVIYO' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve');
      }

      onTaskUpdate?.();
      onClose();
    } catch (err) {
      setError('Failed to approve task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNeedsRevision = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/clients/${publicKey}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'NEEDS_REVISIONS' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to request revisions');
      }

      onTaskUpdate?.();
      onClose();
    } catch (err) {
      setError('Failed to request revisions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="neu-card rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#17181c] mb-2">{task.title}</h2>
              <span className={`pill ${statusColors[task.status] || 'pill-gray'}`}>
                {task.status.replace(/_/g, ' ')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="neu-pressable text-[#626875] hover:text-[#fe7300] w-9 h-9 rounded-xl flex items-center justify-center text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-6 pb-2 space-y-6">
          {error && (
            <div className="neu-inset rounded-2xl p-3">
              <p className="text-[#c0392b] text-sm">{error}</p>
            </div>
          )}

          {task.description && (
            <div>
              <h3 className="font-semibold text-[#17181c] mb-2">Description</h3>
              <p className="text-[#626875]">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-[#17181c] mb-1">Due date</h3>
              <p className="text-[#626875]">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
            </div>
          </div>

          {figmaLink && (
            <div className="border-t border-[#eceef2] pt-6">
              <h3 className="font-semibold text-[#17181c] mb-3">Deliverables</h3>
              <a
                href={figmaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Figma design
              </a>
            </div>
          )}

          {task.comments && task.comments.length > 0 && (
            <div className="border-t border-[#eceef2] pt-6">
              <h3 className="font-semibold text-[#17181c] mb-3">Notes &amp; feedback</h3>
              <div className="space-y-2">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="neu-inset p-3 rounded-xl">
                    <p className="text-[#17181c] text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.status === 'CLIENT_REVIEW' && (
            <div className="border-t border-[#eceef2] pt-6">
              <h3 className="font-semibold text-[#17181c] mb-3">Your action</h3>
              <p className="text-[#626875] text-sm mb-4">Review the deliverables above and let us know your feedback.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-[#3f9d54] hover:bg-[#357a41] text-white py-3 px-4 rounded-2xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing…' : 'Approve'}
                </button>
                <button
                  onClick={handleNeedsRevision}
                  disabled={loading}
                  className="flex-1 bg-[#d9534f] hover:bg-[#c0392b] text-white py-3 px-4 rounded-2xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing…' : 'Needs revision'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <button
            onClick={onClose}
            className="neu-pressable w-full py-3 px-4 rounded-2xl font-semibold text-[#17181c]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
