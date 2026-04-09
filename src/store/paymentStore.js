import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import defaultPayments from '../data/payments.json';

export const usePaymentStore = create((set, get) => ({
  payments: [],

  init: () => {
    const stored = loadFromStorage('xarm_payments', defaultPayments);
    set({ payments: stored });
  },

  addPayment: (payment) => {
    const payments = [...get().payments, { ...payment, id: `PAY${Date.now()}` }];
    set({ payments });
    saveToStorage('xarm_payments', payments);
  },

  markPaid: (id, method, ref) => {
    const payments = get().payments.map(p =>
      p.id === id ? { ...p, status: 'Paid', paidDate: new Date().toISOString().slice(0, 10), method, ref } : p
    );
    set({ payments });
    saveToStorage('xarm_payments', payments);
  },

  deletePayment: (id) => {
    const payments = get().payments.filter(p => p.id !== id);
    set({ payments });
    saveToStorage('xarm_payments', payments);
  },
}));