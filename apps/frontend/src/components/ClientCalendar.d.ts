import { Client } from '../types/index.js';
interface ClientCalendarProps {
    client: Client;
    publicKey: string;
    onTaskUpdate?: () => void;
}
export default function ClientCalendar({ client, publicKey, onTaskUpdate }: ClientCalendarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ClientCalendar.d.ts.map