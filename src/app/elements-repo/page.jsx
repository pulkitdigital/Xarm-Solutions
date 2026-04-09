'use client';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import Header from '../../components/header';
import DataTable from '../../components/table';
import Modal from '../../components/modal';
import StatusCard from '../../components/status-card';
import { loadFromStorage, saveToStorage } from '../../utils/localStorage';

const DEFAULT_ITEMS = [
  { id: 'EL001', name: 'Truss 3m Section', category: 'Fabrication', qty: 24, available: 20, unit: 'pcs', rate: 800, location: 'Warehouse A', notes: '' },
  { id: 'EL002', name: 'LED PAR Can', category: 'Lighting', qty: 48, available: 40, unit: 'pcs', rate: 1200, location: 'Warehouse A', notes: '' },
  { id: 'EL003', name: 'Subwoofer 18"', category: 'AV', qty: 8, available: 8, unit: 'pcs', rate: 3500, location: 'Warehouse B', notes: '' },
  { id: 'EL004', name: 'Round Table 5ft', category: 'Furniture', qty: 30, available: 25, unit: 'pcs', rate: 400, location: 'Warehouse B', notes: '' },
  { id: 'EL005', name: 'Carpet Roll (20m)', category: 'Decor', qty: 10, available: 7, unit: 'rolls', rate: 2000, location: 'Warehouse A', notes: 'Red & Blue' },
  { id: 'EL006', name: 'Podium', category: 'Furniture', qty: 5, available: 3, unit: 'pcs', rate: 1500, location: 'Warehouse B', notes: '' },
];

const EMPTY = { name: '', category: 'AV', qty: 0, available: 0, unit: 'pcs', rate: 0, location: '', notes: '' };

export default function ElementsRepoPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  useEffect(() => {
    const stored = loadFromStorage('xarm_elements', DEFAULT_ITEMS);
    setItems(stored);
  }, []);

  const save = (updated) => { setItems(updated); saveToStorage('xarm_elements', updated); };

  const filtered = useMemo(() => items.filter(i => {
    const ms = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === 'All' || i.category === catFilter;
    return ms && mc;
  }), [items, search, catFilter]);

  const categories = [...new Set(items.map(i => i.category))];

  const openAdd = () => { setForm(EMPTY); setModal('form'); };
  const openEdit = (item) => { setForm({ ...item }); setEditId(item.id); setModal('form'); };
  const closeModal = () => { setModal(null); setEditId(null); };

  const handleSave = () => {
    if (!form.name) return;
    if (editId) save(items.map(i => i.id === editId ? { ...i, ...form } : i));
    else save([...items, { ...form, id: `EL${Date.now()}`, qty: Number(form.qty), available: Number(form.available) }]);
    closeModal();
  };

  const updateQty = (id, delta) => {
    const updated = items.map(i => i.id === id ? { ...i, available: Math.max(0, Math.min(i.qty, i.available + delta)) } : i);
    save(updated);
  };

  const col = createColumnHelper();
  const columns = [
    col.accessor('name', { header: 'Item Name', cell: i => <span className="font-semibold text-white">{i.getValue()}</span> }),
    col.accessor('category', { header: 'Category', cell: i => <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{i.getValue()}</span> }),
    col.accessor('location', { header: 'Location', cell: i => <span className="text-xs text-slate-400">{i.getValue()}</span> }),
    col.accessor('unit', { header: 'Unit' }),
    col.accessor('rate', { header: 'Rate', cell: i => <span className="font-mono text-amber-400 text-xs">₹{Number(i.getValue()).toLocaleString()}</span> }),
    col.accessor('qty', { header: 'Total Qty', cell: i => <span className="font-mono">{i.getValue()}</span> }),
    col.display({
      id: 'available',
      header: 'Available',
      cell: ({ row }) => {
        const { id, available, qty } = row.original;
        const pct = qty > 0 ? (available / qty) * 100 : 0;
        const color = pct >= 60 ? 'text-green-400' : pct >= 30 ? 'text-amber-400' : 'text-red-400';
        return (
          <div className="flex items-center gap-2">
            {pct < 30 && <AlertTriangle size={11} className="text-red-400" />}
            <span className={`font-mono font-bold text-sm ${color}`}>{available}</span>
            <div className="flex gap-1">
              <button onClick={() => updateQty(id, -1)} className="w-5 h-5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs flex items-center justify-center">−</button>
              <button onClick={() => updateQty(id, 1)} className="w-5 h-5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs flex items-center justify-center">+</button>
            </div>
          </div>
        );
      }
    }),
    col.display({
      id: 'bar',
      header: 'Availability',
      cell: ({ row }) => {
        const { available, qty } = row.original;
        const pct = qty > 0 ? (available / qty) * 100 : 0;
        return (
          <div className="w-24">
            <div className="h-1.5 bg-[#1e2530] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 60 ? 'bg-green-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-0.5">{Math.round(pct)}%</p>
          </div>
        );
      }
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
          <button onClick={() => save(items.filter(i => i.id !== row.original.id))}
            className="w-7 h-7 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      )
    }),
  ];

  const lowStock = items.filter(i => i.qty > 0 && (i.available / i.qty) < 0.3).length;

  return (
    <div>
      <Header
        title="Elements Repo"
        subtitle="Inventory & availability management"
        actions={
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-colors">
            <Plus size={13} /> Add Item
          </button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Items" value={items.length} icon={Package} accent="amber" />
          <StatusCard label="Total Units" value={items.reduce((a, i) => a + i.qty, 0)} accent="blue" />
          <StatusCard label="Available" value={items.reduce((a, i) => a + i.available, 0)} accent="green" />
          <StatusCard label="Low Stock" value={lowStock} accent="red" icon={AlertTriangle} />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="!w-56" />
          <div className="flex gap-2">
            {['All', ...categories].map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${catFilter === c ? 'bg-amber-500 text-black' : 'bg-[#1a2030] text-slate-400 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={filtered} />
      </div>

      <Modal open={modal === 'form'} onClose={closeModal} title={editId ? 'Edit Item' : 'Add Item'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[['Item Name', 'name', 'text'], ['Rate (₹)', 'rate', 'number'], ['Total Qty', 'qty', 'number'], ['Available Qty', 'available', 'number'], ['Unit', 'unit', 'text'], ['Location', 'location', 'text']].map(([l, k, t]) => (
            <div key={k}>
              <label>{l}</label>
              <input type={t} value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['AV', 'Lighting', 'Fabrication', 'Furniture', 'Decor', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Notes</label>
            <input value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={closeModal} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-lg transition-colors">Save Item</button>
        </div>
      </Modal>
    </div>
  );
}