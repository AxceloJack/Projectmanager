import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-gray-800 px-8 py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{client.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Campaign Timeline</p>
          </div>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold text-sm transition-all shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
              title="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-0 bg-black/50 border-b border-gray-800">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-4 py-4 font-bold text-gray-400 text-center text-sm uppercase tracking-wide border-r border-gray-800 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-32 p-3 border-r border-b border-gray-800 last:border-r-0 ${
                  day && isSameMonth(day, currentMonth) ? 'bg-gray-900/30 hover:bg-gray-900/50' : 'bg-black/30'
                } transition`}
              >
                {day && (
                  <>
                    <div className={`font-bold text-sm mb-2 ${isSameMonth(day, currentMonth) ? 'text-white' : 'text-gray-600'}`}>
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
      </div>

      {/* Modals */}
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
