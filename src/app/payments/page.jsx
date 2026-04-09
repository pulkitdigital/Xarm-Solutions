'use client';
import { useEffect, useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, CreditCard, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '../../components/header';
import DataTable from '../../components/table';
import Modal from '../../components/modal';
import StatusCard from '../../components/status-card';
import { usePaymentStore } from '../../store/paymentStore';

const STATUS_STYLE = {
  Paid: 'bg-green-500/15 text-green-400 border-green-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Overdue: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const EMPTY = { type: 'incoming', party: '', eventName: '', amount: '', dueDate: '', method: '', status: 'Pending' };

export default function PaymentsPage() {
  const { payments, init, addPayment, markPaid, deletePayment } = usePaymentStore();
  const [tab, setTab] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [markModal, setMarkModal] = useState(null);
  const [markForm, setMarkForm] = useState({ method: 'NEFT', ref: '' });

  useEffect(() => { init(); }, []);

  const filtered = useMemo(() => {
    if (tab === 'all') return payments;
    return payments.filter(p => p.type === tab);
  }, [payments, tab]);

  const stats = useMemo(() => ({
    incoming: payments.filter(p => p.type === 'incoming').reduce((a, p) => a + p.amount, 0),
    outgoing: payments.filter(p => p.type === 'outgoing').reduce((a, p) => a + p.amount, 0),
    paidIn: payments.filter(p => p.type === 'incoming' && p.status === 'Paid').reduce((a, p) => a + p.amount, 0),
    overdue: payments.filter(p => p.status === 'Overdue').length,
  }), [payments]);

  const col = createColumnHelper();
  const columns = [
    col.accessor('id', { header: 'ID', cell: i => <span className="font-mono text-xs text-slate-500">{i.getValue()}</span> }),
    col.accessor('type', {
      header: 'Type',
      cell: i => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${i.getValue() === 'incoming' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          {i.getValue() === 'incoming' ? '↓ In' : '↑ Out'}
        </span>
      )
    }),
    col.accessor('party', { header: 'Party', cell: i => <span className="font-medium text-white">{i.getValue()}</span> }),
    col.accessor('eventName', { header: 'Event', cell: i => <span className="text-xs text-slate-400">{i.getValue()}</span> }),
    col.accessor('amount', { header: 'Amount', cell: i => <span className="font-mono font-bold text-amber-400">₹{Number(i.getValue()).toLocaleString()}</span> }),
    col.accessor('dueDate', { header: 'Due Date', cell: i => <span className="font-mono text-xs">{i.getValue()}</span> }),
    col.accessor('paidDate', { header: 'Paid Date', cell: i => <span className="font-mono text-xs text-slate-500">{i.getValue() || '—'}</span> }),
    col.accessor('method', { header: 'Method', cell: i => <span className="text-xs text-slate-400">{i.getValue() || '—'}</span> }),
    col.accessor('status', {
      header: 'Status',
      cell: i => <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[i.getValue()] || ''}`}>{i.getValue()}</span>
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          {row.original.status !== 'Paid' && (
            <button onClick={() => { setMarkModal(row.original); setMarkForm({ method: 'NEFT', ref: '' }); }}
              className="w-7 h-7 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-colors" title="Mark Paid">
              <CheckCircle size={12} />
            </button>
          )}
          <button onClick={() => deletePayment(row.original.id)}
            className="w-7 h-7 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
            ×
          </button>
        </div>
      )
    }),
  ];

  const handleSave = () => {
    if (!form.party || !form.amount) return;
    addPayment({ ...form, amount: Number(form.amount), paidDate: null, ref: '' });
    setModal(false);
    setForm(EMPTY);
  };

  const handleMarkPaid = () => {
    if (!markModal) return;
    markPaid(markModal.id, markForm.method, markForm.ref);
    setMarkModal(null);
  };

  return (
    <div>
      <Header
        title="Payments"
        subtitle="Track incoming & outgoing payments"
        actions={
          <button onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
            <Plus size={13} /> Add Payment
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Incoming" value={`₹${(stats.incoming / 1000).toFixed(0)}K`} icon={TrendingUp} accent="green" />
          <StatusCard label="Total Outgoing" value={`₹${(stats.outgoing / 1000).toFixed(0)}K`} icon={TrendingDown} accent="red" />
          <StatusCard label="Collected" value={`₹${(stats.paidIn / 1000).toFixed(0)}K`} icon={CreditCard} accent="amber" />
          <StatusCard label="Overdue" value={stats.overdue} icon={AlertCircle} accent="red" />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#111827] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">Incoming Summary</p>
              <TrendingUp size={14} className="text-green-400" />
            </div>
            {[
              { label: 'Total Expected', val: stats.incoming },
              { label: 'Collected', val: stats.paidIn },
              { label: 'Pending', val: stats.incoming - stats.paidIn },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#1e2530] last:border-0">
                <span className="text-xs text-slate-400">{label}</span>
                <span className="font-mono text-sm font-bold text-green-400">₹{val?.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#111827] border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Outgoing Summary</p>
              <TrendingDown size={14} className="text-red-400" />
            </div>
            {(() => {
              const outPayments = payments.filter(p => p.type === 'outgoing');
              const paidOut = outPayments.filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
              return [
                { label: 'Total Committed', val: stats.outgoing },
                { label: 'Paid to Vendors', val: paidOut },
                { label: 'Balance Due', val: stats.outgoing - paidOut },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#1e2530] last:border-0">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="font-mono text-sm font-bold text-red-400">₹{val?.toLocaleString()}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="flex gap-2">
          {[['all', 'All'], ['incoming', '↓ Incoming'], ['outgoing', '↑ Outgoing']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${tab === val ? 'bg-amber-500 text-black' : 'bg-[#1a2030] text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        <DataTable columns={columns} data={filtered} />
      </div>

      {/* Add Payment Modal */}
      <Modal open={!!modal} onClose={() => setModal(false)} title="Add Payment" size="md">
        <div className="space-y-4">
          <div>
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="incoming">Incoming (from Client)</option>
              <option value="outgoing">Outgoing (to Vendor)</option>
            </select>
          </div>
          <div><label>Party Name</label><input value={form.party} onChange={e => setForm(p => ({ ...p, party: e.target.value }))} /></div>
          <div><label>Event Name</label><input value={form.eventName} onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))} /></div>
          <div><label>Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
          <div><label>Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors">Add Payment</button>
        </div>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal open={!!markModal} onClose={() => setMarkModal(null)} title="Mark as Paid" size="sm">
        {markModal && (
          <div className="space-y-4">
            <div className="bg-[#0d1117] rounded-lg p-3">
              <p className="text-xs text-slate-500">Payment to/from</p>
              <p className="font-semibold text-white">{markModal.party}</p>
              <p className="text-amber-400 font-bold font-mono">₹{markModal.amount?.toLocaleString()}</p>
            </div>
            <div>
              <label>Payment Method</label>
              <select value={markForm.method} onChange={e => setMarkForm(p => ({ ...p, method: e.target.value }))}>
                {['NEFT', 'RTGS', 'UPI', 'Cheque', 'Cash', 'IMPS'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label>Reference / UTR</label><input value={markForm.ref} onChange={e => setMarkForm(p => ({ ...p, ref: e.target.value }))} placeholder="Enter reference number" /></div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => setMarkModal(null)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
          <button onClick={handleMarkPaid} className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors">Confirm Paid</button>
        </div>
      </Modal>
    </div>
  );
}