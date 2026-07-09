import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const statusColors = {
    NOT_STARTED: { bg: 'bg-gray-100', text: 'text-gray-700' },
    DESIGN_PHASE: { bg: 'bg-blue-100', text: 'text-blue-700' },
    CLIENT_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    NEEDS_REVISIONS: { bg: 'bg-red-100', text: 'text-red-700' },
    READY_FOR_KLAVIYO: { bg: 'bg-green-100', text: 'text-green-700' },
    COMPLETE: { bg: 'bg-purple-100', text: 'text-purple-700' },
};
const statusLabels = {
    NOT_STARTED: 'Not Started',
    DESIGN_PHASE: 'Design',
    CLIENT_REVIEW: 'Review',
    NEEDS_REVISIONS: 'Revisions',
    READY_FOR_KLAVIYO: 'Ready',
    COMPLETE: 'Complete',
};
export default function ClientTaskCard({ task, onClick, publicKey, }) {
    const colors = statusColors[task.status];
    const label = statusLabels[task.status];
    return (_jsxs("button", { onClick: onClick, className: `w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-opacity hover:opacity-75 cursor-pointer ${colors.bg} ${colors.text}`, title: task.title, children: [_jsx("span", { className: "block truncate", children: task.title }), _jsx("span", { className: "text-xs opacity-75", children: label })] }));
}
//# sourceMappingURL=ClientTaskCard.js.map