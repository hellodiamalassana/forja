import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('forja_token', token);
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('forja_token');
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      initAuth: () => {
        const token = localStorage.getItem('forja_token');
        if (token) {
          // In production, validate token with backend
          set({ token, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'forja-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
