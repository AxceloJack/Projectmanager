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
        <div className="grid grid-cols-7 gap-0 border-b bg-gray-900">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-4 py-3 font-semibold text-gray-300 text-center border-r border-gray-800 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0">
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
    NOT_STARTED: 'bg-gray-700 text-gray-300',
    DESIGN_PHASE: 'bg-blue-900 text-blue-300',
    CLIENT_REVIEW: 'bg-orange-600 text-orange-100',
    NEEDS_REVISIONS: 'bg-red-900 text-red-300',
    READY_FOR_KLAVIYO: 'bg-green-900 text-green-300',
    COMPLETE: 'bg-purple-900 text-purple-300',
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{task.title}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status] || 'bg-gray-800 text-gray-300'}`}>
                {task.status.replace(/_/g, ' ')}
              </span>
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

          {figmaLink && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-300 mb-3">Deliverables</h3>
              <a
                href={figmaLink}
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

          {task.status === 'CLIENT_REVIEW' && (
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold text-gray-300 mb-3">Your Action</h3>
              <p className="text-gray-400 text-sm mb-4">Review the deliverables above and let us know your feedback.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing...' : 'Approved'}
                </button>
                <button
                  onClick={handleNeedsRevision}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing...' : 'Needs Revision'}
                </button>
              </div>
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
