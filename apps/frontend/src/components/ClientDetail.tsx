import { useParams } from 'react-router-dom';

interface ClientDetailProps {
  onTasksChange: () => void;
}

export default function ClientDetail({ onTasksChange }: ClientDetailProps) {
  const { clientId } = useParams<{ clientId: string }>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Client Details</h1>
      <p className="text-gray-600 mt-2">Client ID: {clientId}</p>
    </div>
  );
}
