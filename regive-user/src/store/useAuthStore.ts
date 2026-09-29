import { create } from 'zustand';
import { User } from '@/types';
import { authService, LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/services/authService';
import { tokenStorage } from '@/services/apiClient';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  loadUser: async () => {
    const token = tokenStorage.get();
    if (!token) {
      set({ user: null, token: null, initialized: true });
      return;
    }
    set({ loading: true, token });
    try {
      const user = await authService.getMe();
      set({ user, token, loading: false, initialized: true });
    } catch {
      tokenStorage.remove();
      set({ user: null, token: null, loading: false, initialized: true });
    }
  },

  login: async (payload: LoginPayload) => {
    set({ loading: true });
    try {
      const { user, token } = await authService.login(payload);
      tokenStorage.set(token);
      set({ user, token, loading: false, initialized: true });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ loading: true });
    try {
      const { user, token } = await authService.register(payload);
      tokenStorage.set(token);
      set({ user, token, loading: false, initialized: true });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    tokenStorage.remove();
    set({ user: null, token: null, initialized: true });
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    set({ loading: true });
    try {
      const updatedUser = await authService.updateProfile(payload);
      set({ user: updatedUser, loading: false });
      return updatedUser;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));
