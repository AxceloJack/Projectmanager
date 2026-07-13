import { useState } from 'react';
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
  NOT_STARTED: 'Not started',
  DESIGN_PHASE: 'Design phase',
  CLIENT_REVIEW: 'Client review',
  NEEDS_REVISIONS: 'Needs revisions',
  READY_FOR_KLAVIYO: 'Ready for Klaviyo',
  COMPLETE: 'Complete',
};

const tagLabels: Record<TaskTag, string> = {
  FLOW: 'Flow',
  CAMPAIGN: 'Campaign',
  SIDE_QUEST: 'Side quest',
};

const labelCls = 'block text-sm font-semibold text-[#474747] mb-2 ml-1';
const inputCls = 'neu-input w-full px-4 py-2.5 rounded-xl focus:outline-none';

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
        await tasksAPI.update(task.id, { title, description, dueDate, status, tag, figmaLink });
      } else {
        await tasksAPI.create({ clientId, title, description, dueDate, status, tag, figmaLink });
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
    <div className="neu-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="neu-card rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex justify-between items-center sticky top-0 bg-[#e0e5ec] z-10 rounded-t-[24px]">
          <h2 className="text-xl font-bold text-[#474747]">{task ? 'Edit task' : 'Create task'}</h2>
          <button
            onClick={onClose}
            className="neu-pressable text-[#7b879c] hover:text-[#fe7300] w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div>
            <label className={labelCls}>Task title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputCls}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputCls}>
                {taskStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Tag</label>
              <select value={tag} onChange={(e) => setTag(e.target.value as TaskTag)} className={inputCls}>
                {taskTags.map((t) => (
                  <option key={t} value={t}>
                    {tagLabels[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Figma link</label>
            <input
              type="url"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              className={inputCls}
              placeholder="Leave empty to use the client's Figma board"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-accent flex-1 py-3 px-4 rounded-2xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : task ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="neu-pressable flex-1 py-3 px-4 rounded-2xl font-semibold text-[#474747]"
            >
              Cancel
            </button>
            {task && (
              <button
                type="button"
                onClick={handleDelete}
                className="neu-pressable py-3 px-4 rounded-2xl font-semibold text-[#c0392b]"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {/* Comments */}
        {task && (
          <div className="px-6 pb-6 pt-5 border-t border-[#cdd4de] space-y-4">
            <h3 className="font-bold text-[#474747]">Comments &amp; notes</h3>

            {comments.length > 0 && (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="neu-inset p-3 rounded-xl">
                    <div className="text-xs font-semibold text-[#7b879c] mb-1">{comment.user?.email}</div>
                    <div className="text-sm text-[#474747]">{comment.content}</div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note…"
                className="neu-input flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              />
              <button type="submit" className="btn-accent px-5 py-2.5 rounded-xl font-semibold text-sm">
                Add
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
