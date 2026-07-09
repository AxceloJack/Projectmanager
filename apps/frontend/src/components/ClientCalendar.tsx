import { useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSunday, isSaturday, addMonths, subMonths } from 'date-fns';
import { Client, Task } from '../types/index.js';
import ClientTaskCard from './ClientTaskCard.js';

interface ClientCalendarProps {
  client: Client;
  publicKey: string;
}

export default function ClientCalendar({ client, publicKey }: ClientCalendarProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter to only show FLOW and CAMPAIGN tasks (hide SIDE_QUEST)
  const visibleTasks = (client.tasks || []).filter((task) => task.tag === 'FLOW' || task.tag === 'CAMPAIGN');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Filter calendar to show only Mon-Fri
  const allDays = Array(days[0].getDay() || 7)
    .fill(null)
    .concat(days);
  const calendarDays = allDays.filter((day) => !day || (!isSunday(day) && !isSaturday(day)));

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
          className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded transition"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded transition"
        >
          Next →
        </button>
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 gap-0 border-b bg-gray-900">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-4 py-3 font-semibold text-gray-300 text-center border-r border-gray-800 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-0">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-32 p-3 border-r border-b border-gray-800 last:border-r-0 ${
                day && isSameMonth(day, currentMonth) ? 'bg-black hover:bg-gray-900' : 'bg-gray-950'
              } transition`}
            >
              {day && (
                <>
                  <div className={`font-semibold text-sm mb-2 ${isSameMonth(day, currentMonth) ? 'text-white' : 'text-gray-600'}`}>
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
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

function ClientTaskDetail({
  task,
  publicKey,
  onClose,
}: {
  task: Task;
  publicKey: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusColors: Record<string, string> = {
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    DESIGN_PHASE: 'bg-blue-100 text-blue-800',
    CLIENT_REVIEW: 'bg-orange-100 text-orange-800',
    NEEDS_REVISIONS: 'bg-red-100 text-red-800',
    READY_FOR_KLAVIYO: 'bg-green-100 text-green-800',
    COMPLETE: 'bg-purple-100 text-purple-800',
  };

  const statusOptions = [
    'NOT_STARTED',
    'DESIGN_PHASE',
    'CLIENT_REVIEW',
    'NEEDS_REVISIONS',
    'READY_FOR_KLAVIYO',
    'COMPLETE',
  ];

  const handleStatusChange = async (newStatus: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(
        `/api/public/clients/${publicKey}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
              <div className="flex items-center gap-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-800 text-gray-300'}`}>
                  {status.replace(/_/g, ' ')}
                </span>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={loading}
                  className="px-3 py-1 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 disabled:opacity-50"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-950 border border-red-900 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {task.description && (
            <div>
              <h3 className="font-semibold text-gray-300 mb-2">Description</h3>
              <p className="text-gray-400">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-300 mb-1">Due Date</h3>
              <p className="text-gray-400">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
            </div>
          </div>

          {task.figmaLink && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-300 mb-3">Deliverables</h3>
              <a
                href={task.figmaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Figma Design
              </a>
            </div>
          )}

          {task.comments && task.comments.length > 0 && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-300 mb-3">Notes & Feedback</h3>
              <div className="space-y-2">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-900 border border-gray-800 p-3 rounded">
                    <p className="text-gray-400 text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'CLIENT_REVIEW' && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-300 mb-3">Your Action</h3>
              <p className="text-gray-400 text-sm mb-4">Review the deliverables above and update the status when ready.</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 p-6 bg-black">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 py-2 px-4 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
