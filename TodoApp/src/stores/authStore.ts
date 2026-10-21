import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokenProvider } from '../api/client';
import type { User } from '../types';

const STORAGE_KEY = '@taskflow/auth-v1';

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { token?: string; user?: User };
        if (saved.token && saved.user) {
          set({ token: saved.token, user: saved.user });
        }
      }
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } finally {
      setTokenProvider(() => get().token);
      set({ hydrated: true });
    }
  },

  signIn: async (email, password) => {
    const result = await api.login(email.trim().toLowerCase(), password);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    set({ token: result.token, user: result.user });
    setTokenProvider(() => get().token);
  },

  signUp: async (name, email, password) => {
    const result = await api.register(name.trim(), email.trim().toLowerCase(), password);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    set({ token: result.token, user: result.user });
    setTokenProvider(() => get().token);
  },

  signOut: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
    setTokenProvider(() => null);
  },
}));
