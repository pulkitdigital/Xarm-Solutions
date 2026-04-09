import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import defaultVendors from '../data/vendors.json';

export const useVendorStore = create((set, get) => ({
  vendors: [],
  quotes: [],

  init: () => {
    const vendors = loadFromStorage('xarm_vendors', defaultVendors);
    const quotes = loadFromStorage('xarm_quotes', [
      { id: 'QT001', vendorId: 'VEN001', vendorName: 'SoundWave AV', eventId: 'EVT001', eventName: 'Tech Summit 2025', item: 'Sound System Package', amount: 25000, status: 'Approved', date: '2025-04-20' },
      { id: 'QT002', vendorId: 'VEN002', vendorName: 'LightCraft Studios', eventId: 'EVT001', eventName: 'Tech Summit 2025', item: 'LED Wall Setup', amount: 36000, status: 'Pending', date: '2025-04-22' },
      { id: 'QT003', vendorId: 'VEN005', vendorName: 'StructurePro', eventId: 'EVT001', eventName: 'Tech Summit 2025', item: 'LED Wall Setup', amount: 31000, status: 'Rejected', date: '2025-04-21' },
      { id: 'QT004', vendorId: 'VEN003', vendorName: 'PrimePrint Co.', eventId: 'EVT002', eventName: 'Annual Gala Night', item: 'Branding Prints', amount: 12000, status: 'Pending', date: '2025-04-25' },
    ]);
    set({ vendors, quotes });
  },

  addVendor: (vendor) => {
    const vendors = [...get().vendors, { ...vendor, id: `VEN${Date.now()}`, rating: 0, status: 'Active' }];
    set({ vendors });
    saveToStorage('xarm_vendors', vendors);
  },

  updateVendor: (id, updates) => {
    const vendors = get().vendors.map(v => v.id === id ? { ...v, ...updates } : v);
    set({ vendors });
    saveToStorage('xarm_vendors', vendors);
  },

  deleteVendor: (id) => {
    const vendors = get().vendors.filter(v => v.id !== id);
    set({ vendors });
    saveToStorage('xarm_vendors', vendors);
  },

  addQuote: (quote) => {
    const quotes = [...get().quotes, { ...quote, id: `QT${Date.now()}`, status: 'Pending' }];
    set({ quotes });
    saveToStorage('xarm_quotes', quotes);
  },

  updateQuoteStatus: (id, status) => {
    const quotes = get().quotes.map(q => q.id === id ? { ...q, status } : q);
    set({ quotes });
    saveToStorage('xarm_quotes', quotes);
  },
}));