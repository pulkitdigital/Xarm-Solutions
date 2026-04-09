'use client';
import { useEffect, useState, useMemo } from 'react';
import { Plus, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import Header from '../../components/header';
import Modal from '../../components/modal';
import StatusCard from '../../components/status-card';
import { useVendorStore } from '../../store/vendorStore';

const STATUS_STYLE = {
  Approved: 'bg-green-500/15 text-green-400 border-green-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function VendorQuotesPage() {
  const { quotes, vendors, init, addQuote, updateQuoteStatus } = useVendorStore();
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ vendorId: '', eventName: '', eventId: '', item: '', amount: '' });

  useEffect(() => { init(); }, []);

  const filtered = useMemo(() => filter === 'All' ? quotes : quotes.filter(q => q.status === filter), [quotes, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(q => {
      const key = `${q.eventId || q.eventName}::${q.item}`;
      if (!groups[key]) groups[key] = { event: q.eventName, item: q.item, quotes: [] };
      groups[key].quotes.push(q);
    });
    return Object.values(groups);
  }, [filtered]);

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'Pending').length,
    approved: quotes.filter(q => q.status === 'Approved').length,
    totalValue: quotes.filter(q => q.status === 'Approved').reduce((a, q) => a + q.amount, 0),
  };

  const handleSave = () => {
    const vendor = vendors.find(v => v.id === form.vendorId);
    if (!vendor || !form.item) return;
    addQuote({ ...form, amount: Number(form.amount), vendorName: vendor.name, date: new Date().toISOString().slice(0, 10) });
    setModal(false);
    setForm({ vendorId: '', eventName: '', eventId: '', item: '', amount: '' });
  };

  return (
    <div>
      <Header
        title="Vendor Quotes"
        subtitle="Compare and approve vendor quotes"
        actions={
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
            <Plus size={13} /> Request Quote
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Quotes" value={stats.total} icon={ShoppingCart} accent="amber" />
          <StatusCard label="Pending Review" value={stats.pending} accent="blue" />
          <StatusCard label="Approved" value={stats.approved} accent="green" />
          <StatusCard label="Approved Value" value={`₹${(stats.totalValue / 1000).toFixed(0)}K`} accent="purple" />
        </div>

        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${filter === s ? 'bg-amber-500 text-black' : 'bg-[#1a2030] text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Grouped quote comparison */}
        <div className="space-y-4">
          {grouped.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No quotes found</div>
          ) : (
            grouped.map((group, gi) => (
              <div key={gi} className="bg-[#111827] border border-[#1e2530] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e2530] bg-[#0d1117]">
                  <p className="font-semibold text-white text-sm">{group.item}</p>
                  <p className="text-xs text-slate-500">{group.event}</p>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.quotes.map(q => {
                    const isLowest = group.quotes.every(o => o.id === q.id || q.amount <= o.amount);
                    return (
                      <div key={q.id} className={`rounded-xl border p-4 relative ${isLowest && group.quotes.length > 1 ? 'border-green-500/40 bg-green-500/5' : 'border-[#1e2530]'}`}>
                        {isLowest && group.quotes.length > 1 && (
                          <span className="absolute top-2 right-2 text-[9px] bg-green-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">Lowest</span>
                        )}
                        <p className="font-semibold text-sm text-white">{q.vendorName}</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">₹{q.amount?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{q.date}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[q.status] || ''}`}>{q.status}</span>
                          {q.status === 'Pending' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => updateQuoteStatus(q.id, 'Approved')}
                                className="w-7 h-7 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-colors">
                                <CheckCircle size={12} />
                              </button>
                              <button onClick={() => updateQuoteStatus(q.id, 'Rejected')}
                                className="w-7 h-7 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                                <XCircle size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Request Quote" size="md">
        <div className="space-y-4">
          <div>
            <label>Vendor</label>
            <select value={form.vendorId} onChange={e => setForm(p => ({ ...p, vendorId: e.target.value }))}>
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div><label>Event Name</label><input value={form.eventName} onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))} /></div>
          <div><label>Item / Service</label><input value={form.item} onChange={e => setForm(p => ({ ...p, item: e.target.value }))} /></div>
          <div><label>Quoted Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors">Add Quote</button>
        </div>
      </Modal>
    </div>
  );
}