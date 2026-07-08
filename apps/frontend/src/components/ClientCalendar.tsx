import { useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { Client, Task } from '../types/index.js';
import ClientTaskCard from './ClientTaskCard.js';

interface ClientCalendarProps {
  client: Client;
  publicKey: string;
}

export default function ClientCalendar({ client, publicKey }: ClientCalendarProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const tasks = client.tasks || [];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const calendarDays = Array(days[0].getDay())
    .fill(null)
    .concat(days);

  const getDayTasks = (date: Date) => {
    return tasks.filter(
      (task) =>
        format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          ← Previous
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          Next →
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-0 border-b bg-gray-50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-4 py-3 font-semibold text-gray-900 text-center border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-32 p-3 border-r border-b last:border-r-0 ${
                day && isSameMonth(day, currentMonth) ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="font-semibold text-sm text-gray-900 mb-2">
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {task.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{task.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Due Date</h3>
                <p className="text-gray-600">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Status</h3>
                <p className="text-gray-600">{task.status.replace(/_/g, ' ')}</p>
              </div>
            </div>

            {task.figmaLink && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deliverables</h3>
                <a
                  href={task.figmaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 break-all"
                >
                  View Figma Design
                </a>
              </div>
            )}

            {task.comments && task.comments.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Comments</h3>
                <div className="space-y-2">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded text-sm">
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
