'use client';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Copy, CheckCircle, Trash2, ChevronDown, ChevronUp, FileText, PlusCircle, Minus } from 'lucide-react';
import Header from '../../components/header';
import Modal from '../../components/modal';
import StatusCard from '../../components/status-card';
import { useEstimateStore } from '../../store/estimateStore';

const STATUS_STYLES = {
  Approved: 'bg-green-500/15 text-green-400 border-green-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const EMPTY_ITEM = () => ({ id: `i${Date.now()}`, description: '', category: 'AV', qty: 1, rate: 0, amount: 0 });

export default function ClientEstimatesPage() {
  const { estimates, init, addEstimate, updateEstimate, duplicateEstimate, approveVersion, deleteEstimate } = useEstimateStore();
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ eventName: '', client: '', items: [EMPTY_ITEM()] });

  useEffect(() => { init(); }, []);

  const stats = useMemo(() => ({
    total: estimates.length,
    approved: estimates.filter(e => e.status === 'Approved').length,
    pending: estimates.filter(e => e.status === 'Pending').length,
    totalValue: estimates.reduce((a, e) => {
      const last = e.versions?.[e.versions.length - 1];
      return a + (last?.total || 0);
    }, 0),
  }), [estimates]);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const updateItem = (idx, key, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [key]: val };
    if (key === 'qty' || key === 'rate') {
      items[idx].amount = Number(items[idx].qty) * Number(items[idx].rate);
    }
    setForm(p => ({ ...p, items }));
  };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, EMPTY_ITEM()] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const total = form.items.reduce((a, i) => a + (i.amount || 0), 0);

  const handleSave = () => {
    if (!form.eventName || !form.client) return;
    addEstimate({
      eventName: form.eventName,
      client: form.client,
      status: 'Pending',
      version: 1,
      versions: [{ v: 1, total, date: new Date().toISOString().slice(0, 10), note: 'Initial draft' }],
      items: form.items,
    });
    setModal(false);
    setForm({ eventName: '', client: '', items: [EMPTY_ITEM()] });
  };

  return (
    <div>
      <Header
        title="Client Estimates"
        subtitle="Version-tracked estimates & approvals"
        actions={
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
            <Plus size={13} /> New Estimate
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Estimates" value={stats.total} icon={FileText} accent="amber" />
          <StatusCard label="Approved" value={stats.approved} accent="green" />
          <StatusCard label="Pending" value={stats.pending} accent="blue" />
          <StatusCard label="Total Value" value={`₹${(stats.totalValue / 1000).toFixed(0)}K`} accent="purple" />
        </div>

        <div className="space-y-3">
          {estimates.map(est => {
            const lastVer = est.versions?.[est.versions.length - 1];
            return (
              <div key={est.id} className="bg-[#111827] border border-[#1e2530] rounded-xl overflow-hidden hover:border-amber-500/20 transition-colors">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggle(est.id)}>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{est.eventName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[est.status] || ''}`}>{est.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{est.client} · v{est.version} · {lastVer?.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber-400">₹{lastVer?.total?.toLocaleString()}</span>
                    <div className="flex gap-1.5">
                      {est.status !== 'Approved' && (
                        <button onClick={e => { e.stopPropagation(); approveVersion(est.id); }}
                          className="w-7 h-7 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-colors" title="Approve">
                          <CheckCircle size={12} />
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); duplicateEstimate(est.id); }}
                        className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors" title="Duplicate">
                        <Copy size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteEstimate(est.id); }}
                        className="w-7 h-7 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {expanded[est.id] ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                </div>

                {expanded[est.id] && (
                  <div className="border-t border-[#1e2530] p-4 space-y-4">
                    {/* Version History */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Version History</p>
                      <div className="flex gap-2 flex-wrap">
                        {est.versions?.map(v => (
                          <div key={v.v} className={`text-xs px-3 py-1.5 rounded-lg border ${v.v === est.version ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-[#1e2530] text-slate-500'}`}>
                            v{v.v} · ₹{v.total?.toLocaleString()} · {v.date}
                            {v.note && <span className="text-slate-600 ml-1">({v.note})</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Line Items */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Line Items</p>
                      <div className="rounded-lg border border-[#1e2530] overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-[#0d1117]">
                            <tr>
                              {['Description', 'Category', 'Qty', 'Rate (₹)', 'Amount (₹)'].map(h => (
                                <th key={h} className="text-left px-3 py-2 text-slate-500 font-semibold uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {est.items?.map(item => (
                              <tr key={item.id} className="border-t border-[#1e2530]">
                                <td className="px-3 py-2 text-slate-300">{item.description}</td>
                                <td className="px-3 py-2 text-slate-500">{item.category}</td>
                                <td className="px-3 py-2 text-slate-300">{item.qty}</td>
                                <td className="px-3 py-2 font-mono text-slate-300">₹{Number(item.rate).toLocaleString()}</td>
                                <td className="px-3 py-2 font-mono font-semibold text-amber-400">₹{Number(item.amount).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-amber-500/30 bg-amber-500/5">
                              <td colSpan={4} className="px-3 py-2 text-right font-semibold text-slate-300">Total</td>
                              <td className="px-3 py-2 font-mono font-bold text-amber-400">
                                ₹{est.items?.reduce((a, i) => a + (i.amount || 0), 0).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Estimate Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Client Estimate" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label>Event Name</label><input value={form.eventName} onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))} /></div>
            <div><label>Client</label><input value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} /></div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="!mb-0">Line Items</label>
              <button onClick={addItem} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
                <PlusCircle size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4"><input placeholder="Description" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></div>
                  <div className="col-span-2">
                    <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}>
                      {['AV', 'Fabrication', 'F&B', 'Decor', 'Logistics', 'Service', 'Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2"><input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} /></div>
                  <div className="col-span-2"><input type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} /></div>
                  <div className="col-span-1 text-xs font-mono text-amber-400 text-right">₹{item.amount?.toLocaleString()}</div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400"><Minus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-right mt-2 text-sm font-bold text-amber-400">Total: ₹{total.toLocaleString()}</div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors">Create Estimate</button>
        </div>
      </Modal>
    </div>
  );
}