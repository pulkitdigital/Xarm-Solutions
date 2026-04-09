import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import defaultEstimates from '../data/estimates.json';

export const useEstimateStore = create((set, get) => ({
  estimates: [],

  init: () => {
    const stored = loadFromStorage('xarm_estimates', defaultEstimates);
    set({ estimates: stored });
  },

  addEstimate: (estimate) => {
    const estimates = [...get().estimates, { ...estimate, id: `EST${Date.now()}` }];
    set({ estimates });
    saveToStorage('xarm_estimates', estimates);
  },

  updateEstimate: (id, updates) => {
    const estimates = get().estimates.map(e => e.id === id ? { ...e, ...updates } : e);
    set({ estimates });
    saveToStorage('xarm_estimates', estimates);
  },

  duplicateEstimate: (id) => {
    const src = get().estimates.find(e => e.id === id);
    if (!src) return;
    const copy = { ...src, id: `EST${Date.now()}`, version: 1, status: 'Draft', versions: [{ v: 1, total: src.versions[src.versions.length - 1]?.total || 0, date: new Date().toISOString().slice(0, 10), note: 'Duplicated' }] };
    const estimates = [...get().estimates, copy];
    set({ estimates });
    saveToStorage('xarm_estimates', estimates);
  },

  approveVersion: (id) => {
    const estimates = get().estimates.map(e => e.id === id ? { ...e, status: 'Approved' } : e);
    set({ estimates });
    saveToStorage('xarm_estimates', estimates);
  },

  deleteEstimate: (id) => {
    const estimates = get().estimates.filter(e => e.id !== id);
    set({ estimates });
    saveToStorage('xarm_estimates', estimates);
  },
}));