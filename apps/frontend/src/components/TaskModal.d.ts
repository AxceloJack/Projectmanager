import { Task } from '../types/index.js';
interface TaskModalProps {
    task?: Task;
    clientId: string;
    defaultDueDate?: Date | null;
    onClose: () => void;
    onSave: () => void;
}
export default function TaskModal({ task, clientId, defaultDueDate, onClose, onSave, }: TaskModalProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TaskModal.d.ts.map