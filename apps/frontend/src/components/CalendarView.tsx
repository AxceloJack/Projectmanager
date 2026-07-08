import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { tasksAPI } from '../lib/api.js';
import { Client, Task } from '../types/index.js';
import TaskModal from './TaskModal.js';
import TaskCard from './TaskCard.js';

interface CalendarViewProps {
  client: Client;
  onTasksChange: () => void;
}

export default function CalendarView({ client, onTasksChange }: CalendarViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, [client.id]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.list(client.id);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    onTasksChange();
    setSelectedTask(null);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-600 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          Today
        </button>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
        >
          Next →
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 gap-0 border-b">
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
              className={`min-h-32 p-2 border-r border-b last:border-r-0 ${
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
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {showNewTaskForm && (
        <TaskModal
          clientId={client.id}
          onClose={() => setShowNewTaskForm(false)}
          onSave={handleTaskUpdate}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          clientId={client.id}
          onClose={() => setSelectedTask(null)}
          onSave={handleTaskUpdate}
        />
      )}
    </div>
  );
}
