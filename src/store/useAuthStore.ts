import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isUnlocked: boolean;
  unlock: (key: string) => boolean;
  lock: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isUnlocked: false,
      unlock: (key: string) => {
        if (key === 'WAIZ-DEV-UNLOCK') {
          set({ isUnlocked: true });
          return true;
        }
        return false;
      },
      lock: () => set({ isUnlocked: false }),
    }),
    {
      name: 'lumina-auth-storage',
    }
  )
);
