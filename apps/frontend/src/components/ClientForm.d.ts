import { Client } from '../types/index.js';
interface ClientFormProps {
    client?: Client;
    onSave: (client: Client) => void;
    onCancel: () => void;
}
export default function ClientForm({ client, onSave, onCancel }: ClientFormProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ClientForm.d.ts.map