'use client';
import { useEffect, useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Search, Edit2, Trash2, CalendarDays } from 'lucide-react';
import Header from '../../components/header';
import DataTable from '../../components/table';
import Modal from '../../components/modal';
import StatusCard from '../../components/status-card';
import { useEventStore } from '../../store/eventStore';

const STATUS_COLORS = {
  Confirmed: 'bg-green-500/15 text-green-400 border border-green-500/30',
  'In Progress': 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  Completed: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
};

const EMPTY = { name: '', client: '', date: '', venue: '', city: '', type: 'Conference', manager: '', guests: '', budget: '', status: 'Pending' };

export default function EventsLogPage() {
  const { events, init, addEvent, updateEvent, deleteEvent } = useEventStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  useEffect(() => { init(); }, []);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.client.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  const stats = useMemo(() => ({
    total: events.length,
    confirmed: events.filter(e => e.status === 'Confirmed').length,
    inProgress: events.filter(e => e.status === 'In Progress').length,
    revenue: events.reduce((a, e) => a + (e.budget || 0), 0),
  }), [events]);

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (ev) => { setForm({ ...ev }); setEditId(ev.id); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const handleSave = () => {
    if (!form.name || !form.client) return;
    if (modal === 'add') addEvent(form);
    else updateEvent(editId, form);
    closeModal();
  };

  const col = createColumnHelper();
  const columns = [
    col.accessor('id', { header: 'ID', cell: i => <span className="font-mono text-xs text-slate-500">{i.getValue()}</span> }),
    col.accessor('name', { header: 'Event Name', cell: i => <span className="font-semibold text-white">{i.getValue()}</span> }),
    col.accessor('client', { header: 'Client' }),
    col.accessor('date', { header: 'Date', cell: i => <span className="font-mono text-xs">{i.getValue()}</span> }),
    col.accessor('city', { header: 'City' }),
    col.accessor('type', { header: 'Type', cell: i => <span className="text-xs text-slate-400">{i.getValue()}</span> }),
    col.accessor('status', {
      header: 'Status',
      cell: i => <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[i.getValue()] || ''}`}>{i.getValue()}</span>
    }),
    col.accessor('budget', {
      header: 'Budget',
      cell: i => <span className="font-mono text-amber-400">₹{Number(i.getValue()).toLocaleString()}</span>
    }),
    col.accessor('manager', { header: 'Manager' }),
    col.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(row.original)}
            className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors">
            <Edit2 size={12} />
          </button>
          <button onClick={() => deleteEvent(row.original.id)}
            className="w-7 h-7 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      )
    }),
  ];

  return (
    <div>
      <Header
        title="Events Log"
        subtitle="Manage and track all events"
        actions={
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
            <Plus size={13} /> Add Event
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Events" value={stats.total} icon={CalendarDays} accent="amber" />
          <StatusCard label="Confirmed" value={stats.confirmed} accent="green" />
          <StatusCard label="In Progress" value={stats.inProgress} accent="blue" />
          <StatusCard label="Total Budget" value={`₹${(stats.revenue / 1000).toFixed(0)}K`} accent="purple" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search events, clients..." className="!pl-8" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="!w-36">
            {['All', 'Pending', 'Confirmed', 'In Progress', 'Completed'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={!!modal} onClose={closeModal} title={modal === 'add' ? 'Add New Event' : 'Edit Event'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Event Name', 'name', 'text'],
            ['Client', 'client', 'text'],
            ['Date', 'date', 'date'],
            ['Venue', 'venue', 'text'],
            ['City', 'city', 'text'],
            ['Guests', 'guests', 'number'],
            ['Budget (₹)', 'budget', 'number'],
            ['Manager', 'manager', 'text'],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label>{label}</label>
              <input type={type} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['Conference', 'Gala', 'Launch', 'Retreat', 'Activation', 'Meeting', 'Wedding', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {['Pending', 'Confirmed', 'In Progress', 'Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={closeModal} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors">Save Event</button>
        </div>
      </Modal>
    </div>
  );
}