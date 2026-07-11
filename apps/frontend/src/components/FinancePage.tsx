import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { financeAPI } from '../lib/api.js';
import { FinanceEntry } from '../types/index.js';

const CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD'];

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

function monthKey(dateIso: string) {
  return dateIso.slice(0, 7); // YYYY-MM
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return format(new Date(y, m - 1, 1), 'MMMM yyyy');
}

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [currency, setCurrency] = useState('GBP');
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FinanceEntry | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await financeAPI.list();
      setEntries(res.data.entries);
      setCurrency(res.data.currency || 'GBP');
    } catch (error) {
      console.error('Failed to fetch finance entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (next: string) => {
    setCurrency(next);
    try {
      await financeAPI.setCurrency(next);
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  const handleDelete = async (entry: FinanceEntry) => {
    if (!confirm(`Delete "${entry.description}"?`)) return;
    try {
      await financeAPI.delete(entry.id);
      fetchEntries();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  // Build month options from existing data + current month
  const months = Array.from(
    new Set([format(new Date(), 'yyyy-MM'), ...entries.map((e) => monthKey(e.date))])
  ).sort((a, b) => b.localeCompare(a));

  const visible =
    monthFilter === 'ALL' ? entries : entries.filter((e) => monthKey(e.date) === monthFilter);

  const income = visible.filter((e) => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const expense = visible.filter((e) => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
  const net = income - expense;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      <div className="px-8 py-6">
        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-white">Finance</h1>
            <p className="text-gray-500 text-sm mt-1">Track income and expenses month by month</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 transition"
            >
              <option value="ALL">All time</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-800 rounded text-white text-sm focus:outline-none focus:border-orange-500 transition"
              title="Display currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium text-sm transition whitespace-nowrap"
            >
              + New Entry
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-800 rounded-lg p-5 bg-gray-900/40">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Money In</p>
            <p className="text-2xl font-semibold text-green-400">{money(income, currency)}</p>
          </div>
          <div className="border border-gray-800 rounded-lg p-5 bg-gray-900/40">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Money Out</p>
            <p className="text-2xl font-semibold text-red-400">{money(expense, currency)}</p>
          </div>
          <div className="border border-gray-800 rounded-lg p-5 bg-gray-900/40">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Net</p>
            <p className={`text-2xl font-semibold ${net >= 0 ? 'text-white' : 'text-red-400'}`}>
              {money(net, currency)}
            </p>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-500">
              No entries for this period. Add one to start tracking.
            </p>
          </div>
        ) : (
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {visible.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-900/50 transition">
                    <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                      {format(new Date(e.date), 'd MMM yyyy')}
                    </td>
                    <td className="px-5 py-4 text-white">{e.description}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{e.category || '—'}</td>
                    <td className="px-5 py-4">
                      {e.status === 'PAID' ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-green-950 text-green-300 border border-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gray-900 text-gray-400 border border-gray-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${
                        e.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {e.type === 'INCOME' ? '+' : '−'}
                      {money(e.amount, currency)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(e);
                            setShowForm(true);
                          }}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e)}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-red-950 border border-gray-800 hover:border-red-900 text-gray-500 hover:text-red-400 rounded text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <EntryModal
          entry={editing}
          currency={currency}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchEntries();
          }}
        />
      )}
    </div>
  );
}

function EntryModal({
  entry,
  currency,
  onClose,
  onSaved,
}: {
  entry: FinanceEntry | null;
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(
    entry ? format(new Date(entry.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [description, setDescription] = useState(entry?.description || '');
  const [category, setCategory] = useState(entry?.category || '');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(entry?.type || 'EXPENSE');
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '');
  const [status, setStatus] = useState<'PAID' | 'PENDING'>(entry?.status || 'PAID');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const value = parseFloat(amount);
    if (!description.trim() || isNaN(value) || !date) {
      setError('Date, description and a valid amount are required');
      return;
    }
    setError('');
    setSaving(true);
    const payload = { date, description, category, type, amount: value, status, notes };
    try {
      if (entry) {
        await financeAPI.update(entry.id, payload);
      } else {
        await financeAPI.create(payload);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError('Failed to save entry');
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">{entry ? 'Edit Entry' : 'New Entry'}</h2>
          <p className="text-gray-500 text-sm mt-1">Amounts are in {currency}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-950 border border-red-900 rounded p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className={inputClass}>
                <option value="EXPENSE">Expense (out)</option>
                <option value="INCOME">Income (in)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="e.g. Klaviyo subscription, Client retainer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                placeholder="e.g. Software, Payroll"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputClass}>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Anything worth noting"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 py-2.5 px-4 rounded font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 px-4 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : entry ? 'Update' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
