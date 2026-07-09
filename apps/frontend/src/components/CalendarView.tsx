import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSunday, isSaturday, addMonths, subMonths } from 'date-fns';
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
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<Date | null>(null);
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

  // Filter to show only Monday-Friday
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const allDays = Array(days[0].getDay() || 7)
    .fill(null)
    .concat(days);

  // Filter calendar to show only Mon-Fri
  const calendarDays = allDays.filter((day) => !day || (!isSunday(day) && !isSaturday(day)));

  const getDayTasks = (date: Date) => {
    return tasks.filter(
      (task) =>
        format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">{client.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Campaign Timeline • Click + to add tasks</p>
          </div>
          <button
            onClick={() => {
              const publicUrl = `${window.location.origin}/public/${client.publicKey}`;
              navigator.clipboard.writeText(publicUrl);
              alert('Public link copied to clipboard!');
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.839 10.053 13.081 7 17 7a5 5 0 010 10h-.147M9 19h2.52a5 5 0 001.288-9.868m5.171-5H7.268a7 7 0 000 14h.402m5.614-8.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" />
            </svg>
            Share
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-900 rounded text-gray-400 hover:text-white transition"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded transition"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-900 rounded text-gray-400 hover:text-white transition"
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
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-5 gap-0 bg-gray-900 border-b border-gray-800">
            {weekDays.map((day) => (
              <div
                key={day}
                className="px-4 py-3 font-semibold text-gray-300 text-center text-sm uppercase tracking-wide border-r border-gray-800 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-5">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-32 p-3 border-r border-b border-gray-800 last:border-r-0 group relative ${
                  day && isSameMonth(day, currentMonth) ? 'bg-black hover:bg-gray-900' : 'bg-gray-950'
                } transition`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`font-semibold text-sm ${isSameMonth(day, currentMonth) ? 'text-white' : 'text-gray-600'}`}>
                        {format(day, 'd')}
                      </div>
                      {isSameMonth(day, currentMonth) && (
                        <button
                          onClick={() => {
                            setSelectedDateForNewTask(day);
                            setShowNewTaskForm(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-500/10 rounded text-orange-500 hover:text-orange-400"
                          title="Add task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
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
          defaultDueDate={selectedDateForNewTask}
          onClose={() => {
            setShowNewTaskForm(false);
            setSelectedDateForNewTask(null);
          }}
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
