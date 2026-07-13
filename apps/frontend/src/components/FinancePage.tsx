import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  addWeeks,
  addYears,
  subMonths,
} from 'date-fns';
import { financeAPI, clientsAPI } from '../lib/api.js';
import { FinanceEntry, FxRates, FinanceFrequency, Client } from '../types/index.js';

const CURRENCIES = ['GBP', 'USD', 'EUR', 'AUD', 'CAD'];

const FREQ_LABEL: Record<FinanceFrequency, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

// Convert a value in an entry's currency into the base currency. Prefer the
// rate frozen at the entry's date; fall back to live rates if unavailable.
function valueInBase(value: number, entry: FinanceEntry, base: string, liveRates: Record<string, number>) {
  if (entry.currency === base) return value;
  if (entry.fxBase === base && entry.fxRate != null) return value * entry.fxRate;
  const r = liveRates[entry.currency];
  return r ? value / r : value;
}

function entryInBase(entry: FinanceEntry, base: string, liveRates: Record<string, number>) {
  return valueInBase(entry.amount, entry, base, liveRates);
}

function stepDate(d: Date, freq: FinanceFrequency): Date {
  switch (freq) {
    case 'WEEKLY':
      return addWeeks(d, 1);
    case 'MONTHLY':
      return addMonths(d, 1);
    case 'QUARTERLY':
      return addMonths(d, 3);
    case 'YEARLY':
      return addYears(d, 1);
  }
}

interface Occurrence {
  entry: FinanceEntry;
  date: Date;
  key: string;
}

// Expand entries into the occurrences that fall inside the viewed month.
function occurrencesInMonth(entries: FinanceEntry[], monthStart: Date, monthEnd: Date): Occurrence[] {
  const out: Occurrence[] = [];
  const s = monthStart.getTime();
  const e = monthEnd.getTime();

  for (const entry of entries) {
    const start = new Date(entry.date);
    if (!entry.recurring || !entry.frequency) {
      const t = start.getTime();
      if (t >= s && t <= e) out.push({ entry, date: start, key: entry.id });
      continue;
    }
    const end = entry.endDate ? new Date(entry.endDate).getTime() : Infinity;
    let occ = start;
    let guard = 0;
    while (occ.getTime() <= e && guard < 1000) {
      const t = occ.getTime();
      if (t >= s && t <= e && t <= end) {
        out.push({ entry, date: occ, key: `${entry.id}-${t}` });
      }
      if (t > end) break;
      occ = stepDate(occ, entry.frequency);
      guard++;
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default function FinancePage() {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [base, setBase] = useState('GBP');
  const [fx, setFx] = useState<FxRates>({ base: 'GBP', rates: { GBP: 1 }, updatedAt: null, live: false });
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(startOfMonth(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FinanceEntry | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [finRes, clientRes] = await Promise.all([financeAPI.list(), clientsAPI.list()]);
      setEntries(finRes.data.entries);
      setBase(finRes.data.currency || 'GBP');
      if (finRes.data.fx) setFx(finRes.data.fx);
      setClients(clientRes.data);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (next: string) => {
    setBase(next);
    try {
      await financeAPI.setCurrency(next);
      const res = await financeAPI.list();
      if (res.data.fx) setFx(res.data.fx);
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  const handleDelete = async (entry: FinanceEntry) => {
    const msg = entry.recurring
      ? `Delete the recurring entry "${entry.description}"? This removes all of its occurrences.`
      : `Delete "${entry.description}"?`;
    if (!confirm(msg)) return;
    try {
      await financeAPI.delete(entry.id);
      fetchAll();
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const monthStart = viewMonth;
  const monthEnd = endOfMonth(viewMonth);
  const occurrences = occurrencesInMonth(entries, monthStart, monthEnd);

  let income = 0;
  let expense = 0;
  for (const o of occurrences) {
    const converted = entryInBase(o.entry, base, fx.rates);
    if (o.entry.type === 'INCOME') income += converted;
    else expense += converted;
    // Fees always leave the account, whichever way the entry points.
    if (o.entry.fee) expense += valueInBase(o.entry.fee, o.entry, base, fx.rates);
  }
  const net = income - expense;
  const perOwner = net / 2;

  if (loading) {
    return (
      <div className="neu-surface flex-1 flex items-center justify-center">
        <p className="text-[#7b879c]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="neu-surface flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <div className="flex justify-between items-start mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#474747]">Finance</h1>
            <p className="text-[#7b879c] text-sm mt-1">
              Income &amp; expenses in {base} · exchange rates locked at each entry's date
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={base}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="neu-input px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
              title="Base currency for totals"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  Totals in {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="btn-accent px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap"
            >
              + New entry
            </button>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            className="neu-pressable p-2.5 rounded-xl text-[#474747]"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#474747]">{format(viewMonth, 'MMMM yyyy')}</h2>
            <button
              onClick={() => setViewMonth(startOfMonth(new Date()))}
              className="neu-pressable px-3.5 py-2 text-xs font-semibold text-[#474747] rounded-xl"
            >
              This month
            </button>
          </div>
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="neu-pressable p-2.5 rounded-xl text-[#474747]"
            title="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Money In"
            value={money(income, base)}
            valueColor="text-[#2f7a3f]"
            iconBg="bg-[#d7ead4] text-[#357a41]"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5M5 12l7-7 7 7" />}
          />
          <SummaryCard
            label="Money Out"
            value={money(expense, base)}
            valueColor="text-[#c0392b]"
            iconBg="bg-[#f6d6d3] text-[#a83a30]"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M19 12l-7 7-7-7" />}
          />
          <SummaryCard
            label="Net"
            value={money(net, base)}
            valueColor={net >= 0 ? 'text-[#474747]' : 'text-[#c0392b]'}
            iconBg="bg-[#dbe0e8] text-[#5f6b7a]"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 5h6m-6 5h6M4 5h.01M4 12h.01M4 19h.01" />}
          />
          <SummaryCard
            label="Each owner · 50%"
            value={money(perOwner, base)}
            valueColor={perOwner >= 0 ? 'text-[#e56100]' : 'text-[#c0392b]'}
            iconBg="bg-[#fbe0cc] text-[#b5591f]"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4z" />}
          />
        </div>

        {occurrences.length === 0 ? (
          <div className="neu-inset rounded-2xl p-12 text-center">
            <p className="text-[#7b879c]">Nothing for {format(viewMonth, 'MMMM yyyy')}. Add an entry to start tracking.</p>
          </div>
        ) : (
          <div className="neu-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="text-[#7b879c] text-xs uppercase tracking-wider border-b border-[#cdd4de]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Description</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d3d9e2]">
                {occurrences.map((o) => {
                  const e = o.entry;
                  const converted = entryInBase(e, base, fx.rates);
                  return (
                    <tr key={o.key} className="hover:bg-[#d9dee6]/60 transition-colors">
                      <td className="px-5 py-4 text-[#7b879c] text-sm whitespace-nowrap">
                        {format(o.date, 'd MMM yyyy')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[#474747] font-medium flex items-center gap-2">
                          {e.description}
                          {e.recurring && e.frequency && (
                            <span className="text-[10px] uppercase tracking-wide bg-[#fbe0cc] text-[#b5591f] rounded-full px-2 py-0.5">
                              ↻ {FREQ_LABEL[e.frequency]}
                            </span>
                          )}
                        </div>
                        {e.client && <div className="text-xs text-[#7b879c] mt-0.5">{e.client.name}</div>}
                      </td>
                      <td className="px-5 py-4 text-[#7b879c] text-sm">{e.category || '—'}</td>
                      <td className="px-5 py-4">
                        {e.status === 'PAID' ? (
                          <span className="pill pill-green">Paid</span>
                        ) : (
                          <span className="pill pill-gray">Pending</span>
                        )}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-semibold whitespace-nowrap ${
                          e.type === 'INCOME' ? 'text-[#2f7a3f]' : 'text-[#c0392b]'
                        }`}
                      >
                        <div>
                          {e.type === 'INCOME' ? '+' : '−'}
                          {money(e.amount, e.currency)}
                        </div>
                        {e.currency !== base && (
                          <div className="text-xs text-[#9aa6b8] font-normal">≈ {money(converted, base)}</div>
                        )}
                        {e.fee ? (
                          <div className="text-xs text-[#c0392b] font-normal">− {money(e.fee, e.currency)} fee</div>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditing(e);
                              setShowForm(true);
                            }}
                            className="neu-pressable px-3.5 py-1.5 text-[#474747] rounded-lg text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e)}
                            className="neu-pressable px-3.5 py-1.5 text-[#c0392b] rounded-lg text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <EntryModal
          entry={editing}
          base={base}
          clients={clients}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchAll();
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueColor,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  valueColor: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="neu-card rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[#7b879c] text-xs uppercase tracking-wider truncate">{label}</p>
        <p className={`text-lg sm:text-xl font-bold truncate ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function EntryModal({
  entry,
  base,
  clients,
  onClose,
  onSaved,
}: {
  entry: FinanceEntry | null;
  base: string;
  clients: Client[];
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
  const [fee, setFee] = useState(entry?.fee ? String(entry.fee) : '');
  const [currency, setCurrency] = useState(entry?.currency || base);
  const [status, setStatus] = useState<'PAID' | 'PENDING'>(entry?.status || 'PAID');
  const [clientId, setClientId] = useState(entry?.clientId || '');
  const [repeats, setRepeats] = useState<'ONEOFF' | FinanceFrequency>(
    entry?.recurring && entry.frequency ? entry.frequency : 'ONEOFF'
  );
  const [endDate, setEndDate] = useState(entry?.endDate ? format(new Date(entry.endDate), 'yyyy-MM-dd') : '');
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
    const recurring = repeats !== 'ONEOFF';
    const payload = {
      date,
      description,
      category,
      type,
      amount: value,
      fee: fee ? parseFloat(fee) : 0,
      currency,
      status,
      clientId: clientId || null,
      recurring,
      frequency: recurring ? repeats : null,
      endDate: recurring && endDate ? endDate : null,
      notes,
    };
    try {
      if (entry) await financeAPI.update(entry.id, payload);
      else await financeAPI.create(payload);
      onSaved();
    } catch (err) {
      console.error(err);
      setError('Failed to save entry');
      setSaving(false);
    }
  };

  const inputClass = 'neu-input w-full px-4 py-2.5 rounded-xl focus:outline-none';

  return (
    <div className="neu-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="neu-card rounded-[24px] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#474747]">{entry ? 'Edit entry' : 'New entry'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {error && (
            <div className="neu-inset rounded-2xl p-3">
              <p className="text-[#c0392b] text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className={inputClass}>
                <option value="EXPENSE">Out</option>
                <option value="INCOME">In</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Amount</label>
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
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="e.g. Google Workspace, Client retainer"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Fee (optional)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
            <p className="text-xs text-[#7b879c] mt-1.5 ml-1">
              In {currency} — processing/service fee, deducted from your net automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                placeholder="e.g. Software, Retainer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Client (optional)</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
                <option value="">— None —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">
                {repeats === 'ONEOFF' ? 'Date' : 'Starts'}
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputClass}>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Repeats</label>
              <select value={repeats} onChange={(e) => setRepeats(e.target.value as any)} className={inputClass}>
                <option value="ONEOFF">One-off</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            {repeats !== 'ONEOFF' && (
              <div>
                <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Ends (optional)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#474747] mb-2 ml-1">Notes (optional)</label>
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
              className="neu-pressable flex-1 py-3 px-4 rounded-2xl font-semibold text-[#474747]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-accent flex-1 py-3 px-4 rounded-2xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : entry ? 'Update' : 'Add entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
