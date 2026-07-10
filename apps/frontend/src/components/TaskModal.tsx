import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tasksAPI } from '../lib/api.js';
import { Task, TaskStatus, TaskTag } from '../types/index.js';

interface TaskModalProps {
  task?: Task;
  clientId: string;
  defaultDueDate?: Date | null;
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

const taskTags: TaskTag[] = ['FLOW', 'CAMPAIGN', 'SIDE_QUEST'];

const statusLabels: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  DESIGN_PHASE: 'Design Phase',
  CLIENT_REVIEW: 'Client Review',
  NEEDS_REVISIONS: 'Needs Revisions',
  READY_FOR_KLAVIYO: 'Ready for Klaviyo',
  COMPLETE: 'Complete',
};

const tagLabels: Record<TaskTag, string> = {
  FLOW: 'Flow',
  CAMPAIGN: 'Campaign',
  SIDE_QUEST: 'Side Quest',
};

export default function TaskModal({
  task,
  clientId,
  defaultDueDate,
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task
      ? format(new Date(task.dueDate), 'yyyy-MM-dd')
      : defaultDueDate
      ? format(defaultDueDate, 'yyyy-MM-dd')
      : ''
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'NOT_STARTED');
  const [tag, setTag] = useState<TaskTag>(task?.tag || 'FLOW');
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
          tag,
          figmaLink,
        });
      } else {
        await tasksAPI.create({
          clientId,
          title,
          description,
          dueDate,
          status,
          tag,
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
    if (!confirm('Delete this task?')) return;

    try {
      await tasksAPI.delete(task.id);
      onSave();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-black">
          <h2 className="text-xl font-semibold text-white">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-900 rounded transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition resize-none"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
              >
                {taskStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tag</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as TaskTag)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
              >
                {taskTags.map((t) => (
                  <option key={t} value={t}>
                    {tagLabels[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Figma Link</label>
            <input
              type="url"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition"
              placeholder="Leave empty to use the client's Figma board"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 py-2.5 px-4 rounded font-semibold transition"
            >
              Cancel
            </button>
            {task && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-950 hover:bg-red-900 text-red-400 py-2.5 px-4 rounded font-semibold transition border border-red-900"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {/* Comments Section */}
        {task && (
          <div className="border-t border-gray-800 p-6 bg-black/30 space-y-4">
            <h3 className="font-bold text-gray-300">Comments & Notes</h3>

            {comments.length > 0 && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800/30 border border-gray-700/50 p-3 rounded-lg">
                    <div className="text-xs font-semibold text-gray-400 mb-1">
                      {comment.user?.email}
                    </div>
                    <div className="text-sm text-gray-300">
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition"
              />
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
              >
                Add
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
