import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/localStorage';
import defaultEvents from '../data/events.json';

export const useEventStore = create((set, get) => ({
  events: [],

  init: () => {
    const stored = loadFromStorage('xarm_events', defaultEvents);
    set({ events: stored });
  },

  addEvent: (event) => {
    const events = [...get().events, { ...event, id: `EVT${Date.now()}` }];
    set({ events });
    saveToStorage('xarm_events', events);
  },

  updateEvent: (id, updates) => {
    const events = get().events.map(e => e.id === id ? { ...e, ...updates } : e);
    set({ events });
    saveToStorage('xarm_events', events);
  },

  deleteEvent: (id) => {
    const events = get().events.filter(e => e.id !== id);
    set({ events });
    saveToStorage('xarm_events', events);
  },
}));