
import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  mode: 'home', // 'home' | 'logs' | 'locations' | 'medals' | 'stats' | 'detail'
  selectedLog: null,
  allLogsData: [],

  setMode: (mode) => set({ mode, selectedLog: null }),
  setSelectedLog: (log) => set({ mode: 'detail', selectedLog: log }),
  setAllLogsData: (data) => set({ allLogsData: data }),
}));
