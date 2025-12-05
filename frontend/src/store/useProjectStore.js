import { create } from 'zustand';

const useProjectStore = create((set, get) => ({
  currentSession: null,
  projects: [],
  currentProject: null,
  conversationHistory: [],
  isGenerating: false,
  isBuilding: false,

  setCurrentSession: (sessionId) => {
    set({ currentSession: sessionId });
  },

  addMessage: (role, content) => {
    set((state) => ({
      conversationHistory: [
        ...state.conversationHistory,
        { role, content, timestamp: new Date().toISOString() }
      ]
    }));
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  setGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  setBuilding: (isBuilding) => {
    set({ isBuilding });
  },

  addProject: (project) => {
    set((state) => ({
      projects: [project, ...state.projects]
    }));
  },

  clearCurrentSession: () => {
    set({
      currentSession: null,
      currentProject: null,
      conversationHistory: [],
    });
  },
}));

export default useProjectStore;
