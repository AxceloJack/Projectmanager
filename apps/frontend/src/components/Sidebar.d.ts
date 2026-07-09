import { Client } from '../types/index.js';
interface SidebarProps {
    clients: Client[];
    selectedClient: Client | null;
    onSelectClient: (client: Client) => void;
    onClientsChange: () => void;
}
export default function Sidebar({ clients, selectedClient, onSelectClient, onClientsChange, }: SidebarProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Sidebar.d.ts.map