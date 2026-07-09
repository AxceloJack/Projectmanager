import { Client } from '../types/index.js';
interface ClientFormModalProps {
    client?: Client;
    onSave: (client: Client) => void;
    onCancel: () => void;
}
export default function ClientFormModal({ client, onSave, onCancel }: ClientFormModalProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ClientFormModal.d.ts.map