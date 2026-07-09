import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import ClientTaskCard from './ClientTaskCard.js';
export default function ClientCalendar({ client, publicKey, onTaskUpdate }) {
    const [selectedTask, setSelectedTask] = useState(null);
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
    const getDayTasks = (date) => {
        return visibleTasks.filter((task) => format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("button", { onClick: () => setCurrentMonth(subMonths(currentMonth, 1)), className: "px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded transition", children: "\u2190 Previous" }), _jsx("h2", { className: "text-xl font-semibold text-white", children: format(currentMonth, 'MMMM yyyy') }), _jsx("button", { onClick: () => setCurrentMonth(addMonths(currentMonth, 1)), className: "px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded transition", children: "Next \u2192" })] }), _jsxs("div", { className: "border border-gray-800 rounded-lg overflow-hidden", children: [_jsx("div", { className: "grid grid-cols-7 gap-0 border-b bg-gray-900", children: weekDays.map((day) => (_jsx("div", { className: "px-4 py-3 font-semibold text-gray-300 text-center border-r border-gray-800 last:border-r-0", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-0", children: calendarDays.map((day, index) => (_jsx("div", { className: `min-h-32 p-3 border-r border-b border-gray-800 last:border-r-0 ${day && isSameMonth(day, currentMonth) ? 'bg-black hover:bg-gray-900' : 'bg-gray-950'} transition`, children: day && (_jsxs(_Fragment, { children: [_jsx("div", { className: `font-semibold text-sm mb-2 ${isSameMonth(day, currentMonth) ? 'text-white' : 'text-gray-600'}`, children: format(day, 'd') }), _jsx("div", { className: "space-y-1", children: getDayTasks(day).map((task) => (_jsx(ClientTaskCard, { task: task, onClick: () => setSelectedTask(task), publicKey: publicKey }, task.id))) })] })) }, index))) })] }), selectedTask && (_jsx(ClientTaskDetail, { task: selectedTask, publicKey: publicKey, onClose: () => setSelectedTask(null), onTaskUpdate: onTaskUpdate }))] }));
}
function ClientTaskDetail({ task, publicKey, onClose, onTaskUpdate, }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const statusColors = {
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
            const response = await fetch(`/api/public/clients/${publicKey}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'READY_FOR_KLAVIYO' }),
            });
            if (!response.ok) {
                throw new Error('Failed to approve');
            }
            onTaskUpdate?.();
            onClose();
        }
        catch (err) {
            setError('Failed to approve task');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleNeedsRevision = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`/api/public/clients/${publicKey}/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'NEEDS_REVISIONS' }),
            });
            if (!response.ok) {
                throw new Error('Failed to request revisions');
            }
            onTaskUpdate?.();
            onClose();
        }
        catch (err) {
            setError('Failed to request revisions');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-black border border-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "p-6 border-b border-gray-800", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: task.title }), _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status] || 'bg-gray-800 text-gray-300'}`, children: task.status.replace(/_/g, ' ') })] }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-white text-2xl", children: "\u00D7" })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [error && (_jsx("div", { className: "bg-red-950 border border-red-900 rounded p-3", children: _jsx("p", { className: "text-red-400 text-sm", children: error }) })), task.description && (_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-300 mb-2", children: "Description" }), _jsx("p", { className: "text-gray-400", children: task.description })] })), _jsx("div", { className: "grid grid-cols-2 gap-4", children: _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-300 mb-1", children: "Due Date" }), _jsx("p", { className: "text-gray-400", children: format(new Date(task.dueDate), 'MMM d, yyyy') })] }) }), task.figmaLink && (_jsxs("div", { className: "border-t border-gray-800 pt-6", children: [_jsx("h3", { className: "font-semibold text-gray-300 mb-3", children: "Deliverables" }), _jsxs("a", { href: task.figmaLink, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) }), "View Figma Design"] })] })), task.comments && task.comments.length > 0 && (_jsxs("div", { className: "border-t border-gray-800 pt-6", children: [_jsx("h3", { className: "font-semibold text-gray-300 mb-3", children: "Notes & Feedback" }), _jsx("div", { className: "space-y-2", children: task.comments.map((comment) => (_jsx("div", { className: "bg-gray-900 border border-gray-800 p-3 rounded", children: _jsx("p", { className: "text-gray-400 text-sm", children: comment.content }) }, comment.id))) })] })), task.status === 'CLIENT_REVIEW' && (_jsxs("div", { className: "border-t border-gray-800 pt-6", children: [_jsx("h3", { className: "font-semibold text-gray-300 mb-3", children: "Your Action" }), _jsx("p", { className: "text-gray-400 text-sm mb-4", children: "Review the deliverables above and let us know your feedback." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleApprove, disabled: loading, className: "flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Processing...' : 'Approved' }), _jsx("button", { onClick: handleNeedsRevision, disabled: loading, className: "flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition", children: loading ? 'Processing...' : 'Needs Revision' })] })] }))] }), _jsx("div", { className: "border-t border-gray-800 p-6 bg-black", children: _jsx("button", { onClick: onClose, className: "w-full bg-gray-900 hover:bg-gray-800 text-gray-300 py-2 px-4 rounded-lg font-medium transition", children: "Close" }) })] }) }));
}
//# sourceMappingURL=ClientCalendar.js.map