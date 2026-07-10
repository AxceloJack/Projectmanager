import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { publicAPI } from '../lib/api.js';
import AxceloLogo from '../components/AxceloLogo.js';

interface PublicForm {
  clientName: string;
  month: string;
  status: 'PENDING' | 'SUBMITTED';
  sales?: string | null;
  launches?: string | null;
  specialDates?: string | null;
  avoidances?: string | null;
  notes?: string | null;
}

function formatMonth(month: string) {
  const [year, m] = month.split('-').map(Number);
  return format(new Date(year, m - 1, 1), 'MMMM yyyy');
}

const questions = [
  {
    key: 'sales',
    label: 'Are there any sales or promotions planned?',
    hint: 'Dates, discount amounts, which products — anything you know so far.',
  },
  {
    key: 'launches',
    label: 'Any product launches or new arrivals?',
    hint: 'New products, restocks, or collections dropping this month.',
  },
  {
    key: 'specialDates',
    label: 'Any special dates or events we should plan around?',
    hint: 'Brand anniversaries, holidays you care about, events, collabs.',
  },
  {
    key: 'avoidances',
    label: 'Anything we should avoid?',
    hint: 'Dates not to send on, topics or angles to steer clear of.',
  },
  {
    key: 'notes',
    label: 'Anything else on your mind for this month?',
    hint: 'Goals, ideas, feedback — whatever you want us to know.',
  },
] as const;

export default function PublicFormPage() {
  const { publicKey } = useParams<{ publicKey: string }>();
  const [form, setForm] = useState<PublicForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!publicKey) return;
    publicAPI
      .getForm(publicKey)
      .then((res) => {
        const data: PublicForm = res.data;
        setForm(data);
        setAnswers({
          sales: data.sales || '',
          launches: data.launches || '',
          specialDates: data.specialDates || '',
          avoidances: data.avoidances || '',
          notes: data.notes || '',
        });
      })
      .catch(() => setError('This form link is invalid or has been removed.'))
      .finally(() => setLoading(false));
  }, [publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;
    setError('');
    setSubmitting(true);
    try {
      await publicAPI.submitForm(publicKey, answers);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong submitting the form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <p className="text-gray-400">{error || 'Form not found.'}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-6 shadow-lg">
          <AxceloLogo className="w-9 h-9 text-white" mono />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 text-center">Thank you!</h1>
        <p className="text-gray-400 text-center max-w-md">
          We've received your plans for {formatMonth(form.month)}. The team will build
          your campaign strategy around them — you'll see it all on your calendar soon.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Branded header */}
      <div className="border-b border-gray-800 bg-black/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <AxceloLogo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Axcelo</p>
            <p className="text-xs text-gray-500">Campaign Strategy Form</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          {form.clientName} — {formatMonth(form.month)}
        </h1>
        <p className="text-gray-400 mb-10">
          Help us plan your email campaigns for {formatMonth(form.month)}. Fill in
          whatever applies — skip anything that doesn't.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q) => (
            <div key={q.key}>
              <label className="block text-white font-semibold mb-1">{q.label}</label>
              <p className="text-gray-500 text-sm mb-3">{q.hint}</p>
              <textarea
                value={answers[q.key] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition resize-y"
                placeholder="Type here..."
              />
            </div>
          ))}

          {error && (
            <div className="bg-red-950 border border-red-900 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {submitting
              ? 'Submitting...'
              : form.status === 'SUBMITTED'
                ? 'Update Answers'
                : 'Submit to Axcelo'}
          </button>

          {form.status === 'SUBMITTED' && (
            <p className="text-gray-500 text-sm text-center">
              You've already submitted this form — feel free to update your answers.
            </p>
          )}
        </form>

        <p className="text-gray-600 text-xs text-center mt-10">
          © {new Date().getFullYear()} Axcelo. All campaigns managed with precision.
        </p>
      </div>
    </div>
  );
}
