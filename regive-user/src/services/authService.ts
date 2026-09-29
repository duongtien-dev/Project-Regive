import { apiClient } from './apiClient';
import { ApiResponse, Role, User } from '@/types';

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  role?: Role;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponseData = {
  user: User;
  token: string;
};

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string;
  address?: string;
  beneficiaryInfo?: {
    householdSize?: number;
    note?: string;
  };
};

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>('/auth/me', payload);
    return res.data.data.user;
  },
};
