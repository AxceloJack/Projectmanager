import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
export default function ClientDetail({ onTasksChange }) {
    const { clientId } = useParams();
    return (_jsxs("div", { className: "p-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Client Details" }), _jsxs("p", { className: "text-gray-600 mt-2", children: ["Client ID: ", clientId] })] }));
}
//# sourceMappingURL=ClientDetail.js.map