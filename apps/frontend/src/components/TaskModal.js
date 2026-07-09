import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { format } from 'date-fns';
import { tasksAPI } from '../lib/api.js';
const taskStatuses = [
    'NOT_STARTED',
    'DESIGN_PHASE',
    'CLIENT_REVIEW',
    'NEEDS_REVISIONS',
    'READY_FOR_KLAVIYO',
    'COMPLETE',
];
const taskTags = ['FLOW', 'CAMPAIGN', 'SIDE_QUEST'];
const statusLabels = {
    NOT_STARTED: 'Not Started',
    DESIGN_PHASE: 'Design Phase',
    CLIENT_REVIEW: 'Client Review',
    NEEDS_REVISIONS: 'Needs Revisions',
    READY_FOR_KLAVIYO: 'Ready for Klaviyo',
    COMPLETE: 'Complete',
};
const tagLabels = {
    FLOW: 'Flow',
    CAMPAIGN: 'Campaign',
    SIDE_QUEST: 'Side Quest',
};
export default function TaskModal({ task, clientId, defaultDueDate, onClose, onSave, }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [dueDate, setDueDate] = useState(task
        ? format(new Date(task.dueDate), 'yyyy-MM-dd')
        : defaultDueDate
            ? format(defaultDueDate, 'yyyy-MM-dd')
            : '');
    const [status, setStatus] = useState(task?.status || 'NOT_STARTED');
    const [tag, setTag] = useState(task?.tag || 'FLOW');
    const [figmaLink, setFigmaLink] = useState(task?.figmaLink || '');
    const [comments, setComments] = useState(task?.comments || []);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
            }
            else {
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
        }
        catch (error) {
            console.error('Failed to save task:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!task || !newComment.trim())
            return;
        try {
            const response = await tasksAPI.addComment(task.id, newComment);
            setComments([response.data, ...comments]);
            setNewComment('');
        }
        catch (error) {
            console.error('Failed to add comment:', error);
        }
    };
    const handleDelete = async () => {
        if (!task)
            return;
        if (!confirm('Delete this task?'))
            return;
        try {
            await tasksAPI.delete(task.id);
            onSave();
        }
        catch (error) {
            console.error('Failed to delete task:', error);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-black border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-black", children: [_jsx("h2", { className: "text-xl font-semibold text-white", children: task ? 'Edit Task' : 'Create Task' }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-white p-2 hover:bg-gray-900 rounded transition", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Task Title" }), _jsx("input", { type: "text", value: title, onChange: (e) => setTitle(e.target.value), required: true, className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition", placeholder: "Enter task title" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Description" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition resize-none", placeholder: "Enter task description", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Due Date" }), _jsx("input", { type: "date", value: dueDate, onChange: (e) => setDueDate(e.target.value), required: true, className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Status" }), _jsx("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition", children: taskStatuses.map((s) => (_jsx("option", { value: s, children: statusLabels[s] }, s))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Tag" }), _jsx("select", { value: tag, onChange: (e) => setTag(e.target.value), className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition", children: taskTags.map((t) => (_jsx("option", { value: t, children: tagLabels[t] }, t))) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-300 mb-2", children: "Figma Link" }), _jsx("input", { type: "url", value: figmaLink, onChange: (e) => setFigmaLink(e.target.value), className: "w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition", placeholder: "https://figma.com/..." })] }), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-gray-800", children: [_jsx("button", { type: "submit", disabled: loading, className: "flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Saving...' : task ? 'Update' : 'Create' }), _jsx("button", { type: "button", onClick: onClose, className: "flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 py-2.5 px-4 rounded font-semibold transition", children: "Cancel" }), task && (_jsx("button", { type: "button", onClick: handleDelete, className: "bg-red-950 hover:bg-red-900 text-red-400 py-2.5 px-4 rounded font-semibold transition border border-red-900", children: "Delete" }))] })] }), task && (_jsxs("div", { className: "border-t border-gray-800 p-6 bg-black/30 space-y-4", children: [_jsx("h3", { className: "font-bold text-gray-300", children: "Comments & Notes" }), comments.length > 0 && (_jsx("div", { className: "space-y-3 max-h-48 overflow-y-auto", children: comments.map((comment) => (_jsxs("div", { className: "bg-gray-800/30 border border-gray-700/50 p-3 rounded-lg", children: [_jsx("div", { className: "text-xs font-semibold text-gray-400 mb-1", children: comment.user?.email }), _jsx("div", { className: "text-sm text-gray-300", children: comment.content })] }, comment.id))) })), _jsxs("form", { onSubmit: handleAddComment, className: "flex gap-2", children: [_jsx("input", { type: "text", value: newComment, onChange: (e) => setNewComment(e.target.value), placeholder: "Add a note...", className: "flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition" }), _jsx("button", { type: "submit", className: "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition", children: "Add" })] })] }))] }) }));
}
//# sourceMappingURL=TaskModal.js.map