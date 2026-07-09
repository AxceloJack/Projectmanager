import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import { tasksAPI } from '../lib/api.js';
import TaskModal from './TaskModal.js';
import TaskCard from './TaskCard.js';
export default function CalendarView({ client, onTasksChange }) {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showNewTaskForm, setShowNewTaskForm] = useState(false);
    const [selectedDateForNewTask, setSelectedDateForNewTask] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    useEffect(() => {
        fetchTasks();
    }, [client.id]);
    const fetchTasks = async () => {
        try {
            const response = await tasksAPI.list(client.id);
            setTasks(response.data);
        }
        catch (error) {
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
    // Show all 7 days of the week
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const allDays = Array(days[0].getDay())
        .fill(null)
        .concat(days);
    const calendarDays = allDays;
    const getDayTasks = (date) => {
        return tasks.filter((task) => format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    };
    return (_jsxs("div", { className: "flex-1 flex flex-col bg-black", children: [_jsxs("div", { className: "border-b border-gray-800 px-8 py-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-white", children: client.name }), _jsx("p", { className: "text-gray-500 text-sm mt-1", children: "Campaign Timeline \u2022 Click + to add tasks" })] }), _jsxs("button", { onClick: () => {
                                    const publicUrl = `${window.location.origin}/public/${client.publicKey}`;
                                    navigator.clipboard.writeText(publicUrl);
                                    alert('Public link copied to clipboard!');
                                }, className: "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition flex items-center gap-2", children: [_jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", stroke: "currentColor", children: [_jsx("path", { d: "M11 7C11 9.20914 9.20914 11 7 11C4.79086 11 3 9.20914 3 7C3 4.79086 4.79086 3 7 3C9.20914 3 11 4.79086 11 7ZM4.97715 7C4.97715 8.11719 5.88281 9.02284 7 9.02284C8.11719 9.02284 9.02284 8.11719 9.02284 7C9.02284 5.88281 8.11719 4.97716 7 4.97716C5.88281 4.97716 4.97715 5.88281 4.97715 7Z", fill: "currentColor" }), _jsx("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M2.37162 14.2378C3.54371 13.3886 5.09751 13 7 13C8.90249 13 10.4563 13.3886 11.6284 14.2378C12.8188 15.1004 13.4914 16.3477 13.795 17.8079C14.1811 19.6647 12.5708 21 11 21H3C1.42922 21 -0.181121 19.6647 0.204962 17.8079C0.508602 16.3477 1.18119 15.1004 2.37162 14.2378ZM3.54511 15.8574C2.84896 16.3618 2.39073 17.1203 2.16308 18.2151C2.12425 18.4018 2.17618 18.5729 2.31828 18.7223C2.47041 18.8824 2.71717 19 3 19H11C11.2828 19 11.5296 18.8824 11.6817 18.7223C11.8238 18.5729 11.8757 18.4018 11.8369 18.2151C11.6093 17.1203 11.151 16.3618 10.4549 15.8574C9.74039 15.3397 8.65185 15 7 15C5.34815 15 4.25961 15.3397 3.54511 15.8574Z", fill: "currentColor" }), _jsx("path", { d: "M21 7C21 9.20914 19.2091 11 17 11C14.7909 11 13 9.20914 13 7C13 4.79086 14.7909 3 17 3C19.2091 3 21 4.79086 21 7ZM14.9772 7C14.9772 8.11719 15.8828 9.02284 17 9.02284C18.1172 9.02284 19.0228 8.11719 19.0228 7C19.0228 5.88281 18.1172 4.97716 17 4.97716C15.8828 4.97716 14.9772 5.88281 14.9772 7Z", fill: "currentColor" }), _jsx("path", { d: "M14.5361 13.2689C13.9347 13.4165 13.7248 14.1168 14.0647 14.6344L14.1075 14.6995C14.3593 15.0829 14.839 15.239 15.2891 15.1501C15.7787 15.0534 16.3451 15 17 15C18.6519 15 19.7404 15.3397 20.4549 15.8574C21.1511 16.3618 21.6093 17.1203 21.8369 18.2151C21.8758 18.4018 21.8238 18.5729 21.6817 18.7223C21.5296 18.8824 21.2828 19 21 19H16C15.4478 19 15 19.4477 15 20C15 20.5523 15.4478 21 16 21H21C22.5708 21 24.1811 19.6647 23.7951 17.8079C23.4914 16.3477 22.8188 15.1004 21.6284 14.2378C20.4563 13.3886 18.9025 13 17 13C16.0994 13 15.2769 13.0871 14.5361 13.2689Z", fill: "currentColor" })] }), "Share"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("button", { onClick: () => setCurrentMonth(subMonths(currentMonth, 1)), className: "p-2 hover:bg-gray-900 rounded text-gray-400 hover:text-white transition", title: "Previous month", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("h2", { className: "text-lg font-semibold text-white", children: format(currentMonth, 'MMMM yyyy') }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setCurrentMonth(new Date()), className: "px-3 py-1 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded transition", children: "Today" }), _jsx("button", { onClick: () => setCurrentMonth(addMonths(currentMonth, 1)), className: "p-2 hover:bg-gray-900 rounded text-gray-400 hover:text-white transition", title: "Next month", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] })] })] }), _jsx("div", { className: "flex-1 overflow-auto p-4 sm:p-8", children: _jsxs("div", { className: "border border-gray-800 rounded-lg overflow-hidden w-full", children: [_jsx("div", { className: "grid grid-cols-7 gap-0 bg-gray-900 border-b border-gray-800 w-full", children: weekDays.map((day) => (_jsx("div", { className: "px-2 sm:px-4 py-2 sm:py-3 font-semibold text-gray-300 text-center text-xs sm:text-sm uppercase tracking-wide border-r border-gray-800 last:border-r-0", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 w-full", children: calendarDays.map((day, index) => (_jsx("div", { className: `min-h-24 sm:min-h-32 p-2 sm:p-3 border-r border-b border-gray-800 last:border-r-0 group relative overflow-hidden ${day && isSameMonth(day, currentMonth) ? 'bg-black hover:bg-gray-900' : 'bg-gray-950'} transition`, children: day && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between mb-2.5", children: [_jsx("div", { className: `font-semibold text-sm ${isSameMonth(day, currentMonth) ? 'text-white' : 'text-gray-600'}`, children: format(day, 'd') }), isSameMonth(day, currentMonth) && (_jsx("button", { onClick: () => {
                                                        setSelectedDateForNewTask(day);
                                                        setShowNewTaskForm(true);
                                                    }, className: "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-500/10 rounded text-orange-500 hover:text-orange-400", title: "Add task", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4v16m8-8H4" }) }) }))] }), _jsx("div", { className: "space-y-1", children: getDayTasks(day).map((task) => (_jsx(TaskCard, { task: task, onClick: () => setSelectedTask(task) }, task.id))) })] })) }, index))) })] }) }), showNewTaskForm && (_jsx(TaskModal, { clientId: client.id, defaultDueDate: selectedDateForNewTask, onClose: () => {
                    setShowNewTaskForm(false);
                    setSelectedDateForNewTask(null);
                }, onSave: handleTaskUpdate })), selectedTask && (_jsx(TaskModal, { task: selectedTask, clientId: client.id, onClose: () => setSelectedTask(null), onSave: handleTaskUpdate }))] }));
}
//# sourceMappingURL=CalendarView.js.map