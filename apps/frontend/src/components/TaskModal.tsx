import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tasksAPI } from '../lib/api.js';
import { Task, TaskStatus } from '../types/index.js';

interface TaskModalProps {
  task?: Task;
  clientId: string;
  onClose: () => void;
  onSave: () => void;
}

const taskStatuses: TaskStatus[] = [
  'NOT_STARTED',
  'DESIGN_PHASE',
  'CLIENT_REVIEW',
  'NEEDS_REVISIONS',
  'READY_FOR_KLAVIYO',
  'COMPLETE',
];

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  DESIGN_PHASE: 'Design Phase',
  CLIENT_REVIEW: 'Client Review',
  NEEDS_REVISIONS: 'Needs Revisions',
  READY_FOR_KLAVIYO: 'Ready for Klaviyo',
  COMPLETE: 'Complete',
};

export default function TaskModal({
  task,
  clientId,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'NOT_STARTED');
  const [figmaLink, setFigmaLink] = useState(task?.figmaLink || '');
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (task) {
        await tasksAPI.update(task.id, {
          title,
          description,
          dueDate,
          status,
          figmaLink,
        });
      } else {
        await tasksAPI.create({
          clientId,
          title,
          description,
          dueDate,
          status,
          figmaLink,
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    try {
      const response = await tasksAPI.addComment(task.id, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await tasksAPI.delete(task.id);
      onSave();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {taskStatuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Figma Link
              </label>
              <input
                type="url"
                value={figmaLink}
                onChange={(e) => setFigmaLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://figma.com/..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              {task && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </form>

          {task && comments.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded">
                    <div className="text-sm font-medium text-gray-900">
                      {comment.user?.email}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task && (
            <form onSubmit={handleAddComment} className="mt-4 border-t pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Comment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
