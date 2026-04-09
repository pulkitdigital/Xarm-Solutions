'use client';
import { useEffect, useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, Star, Users } from 'lucide-react';
import Header from '../../components/header';
import DataTable from '../../components/table';
import Modal from '../../components/modal';
import StatusCard from '../../components/status-card';
import { useVendorStore } from '../../store/vendorStore';

const EMPTY = { name: '', category: 'AV Zone', type: 'Fabrication', phone: '', email: '', address: '', gst: '', notes: '' };

export default function VendorManagementPage() {
  const { vendors, init, addVendor, updateVendor, deleteVendor } = useVendorStore();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { init(); }, []);

  const filtered = useMemo(() =>
    vendors.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())),
    [vendors, search]);

  const openAdd = () => { setForm(EMPTY); setModal('form'); };
  const openEdit = (v) => { setForm({ ...v }); setEditId(v.id); setModal('form'); };
  const openDetail = (v) => { setDetail(v); setModal('detail'); };
  const closeModal = () => { setModal(null); setEditId(null); setDetail(null); };

  const handleSave = () => {
    if (!form.name) return;
    if (editId) updateVendor(editId, form);
    else addVendor(form);
    closeModal();
  };

  const col = createColumnHelper();
  const columns = [
    col.accessor('name', { header: 'Vendor Name', cell: i => <button className="font-semibold text-white hover:text-amber-400 transition-colors text-left" onClick={() => openDetail(i.row.original)}>{i.getValue()}</button> }),
    col.accessor('category', { header: 'Category', cell: i => <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{i.getValue()}</span> }),
    col.accessor('type', { header: 'Type', cell: i => <span className="text-xs text-slate-400">{i.getValue()}</span> }),
    col.accessor('phone', { header: 'Phone' }),
    col.accessor('email', { header: 'Email', cell: i => <span className="text-xs text-slate-400 truncate max-w-32 block">{i.getValue()}</span> }),
    col.accessor('rating', {
      header: 'Rating',
      cell: i => (
        <div className="flex items-center gap-1">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-xs text-amber-400 font-semibold">{i.getValue() || '—'}</span>
        </div>
      )
    }),
    col.accessor('status', {
      header: 'Status',
      cell: i => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${i.getValue() === 'Active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
          {i.getValue()}
        </span>
      )
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(row.original)}
            className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors">
            <Edit2 size={12} />
          </button>
          <button onClick={() => deleteVendor(row.original.id)}
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
        title="Vendor Management"
        subtitle="Manage vendor profiles and partnerships"
        actions={
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
            <Plus size={13} /> Add Vendor
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Vendors" value={vendors.length} icon={Users} accent="amber" />
          <StatusCard label="Active" value={vendors.filter(v => v.status === 'Active').length} accent="green" />
          <StatusCard label="AV Zone" value={vendors.filter(v => v.category === 'AV Zone').length} accent="blue" />
          <StatusCard label="Avg Rating" value={(vendors.reduce((a, v) => a + (v.rating || 0), 0) / (vendors.length || 1)).toFixed(1)} accent="purple" />
        </div>

        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="!w-64" />
        </div>

        <DataTable columns={columns} data={filtered} />
      </div>

      {/* Form Modal */}
      <Modal open={modal === 'form'} onClose={closeModal} title={editId ? 'Edit Vendor' : 'Add Vendor'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[['Vendor Name', 'name', 'text'], ['Phone', 'phone', 'text'], ['Email', 'email', 'email'], ['GST Number', 'gst', 'text'], ['Address', 'address', 'text']].map(([label, key, type]) => (
            <div key={key} className={key === 'address' ? 'col-span-2' : ''}>
              <label>{label}</label>
              <input type={type} value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['AV Zone', 'Lighting', 'Logistics', 'Catering', 'Decor', 'Printing', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {['Fabrication', 'F&B', 'Printing', 'Services', 'Rental', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label>Notes</label>
            <textarea value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ resize: 'none' }} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={closeModal} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors">Save Vendor</button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={closeModal} title="Vendor Profile" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{detail.name}</h3>
                <p className="text-sm text-slate-400">{detail.category} · {detail.type}</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-amber-400 font-bold text-sm">{detail.rating || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Phone', detail.phone], ['Email', detail.email],
                ['Address', detail.address], ['GST', detail.gst],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#0d1117] rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">{k}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{v || '—'}</p>
                </div>
              ))}
            </div>
            {detail.notes && (
              <div className="bg-[#0d1117] rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Notes</p>
                <p className="text-xs text-slate-300 mt-0.5">{detail.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}