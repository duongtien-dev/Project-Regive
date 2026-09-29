import { apiClient } from './apiClient';
import { ApiResponse, Campaign } from '@/types';

export const campaignService = {
  async listPublic(params?: { status?: string }): Promise<Campaign[]> {
    const res = await apiClient.get<ApiResponse<{ campaigns: Campaign[] }>>('/campaigns', {
      params,
    });
    return res.data.data.campaigns;
  },

  async getById(id: string): Promise<Campaign> {
    const res = await apiClient.get<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}`);
    return res.data.data.campaign;
  },

  async getCampaignDonations(id: string, limit: number = 20): Promise<{ donations: any[]; total: number; totalAmount: number }> {
    const res = await apiClient.get<ApiResponse<{ donations: any[]; total: number; totalAmount: number }>>(`/campaigns/${id}/donations`, {
      params: { limit },
    });
    return res.data.data;
  },

  async getVolunteers(id: string): Promise<{ volunteers: any[]; total: number }> {
    const res = await apiClient.get<ApiResponse<{ volunteers: any[]; total: number }>>(`/campaigns/${id}/volunteers`);
    return res.data.data;
  },

  async create(payload: Partial<Campaign>): Promise<Campaign> {
    const res = await apiClient.post<ApiResponse<{ campaign: Campaign }>>('/campaigns', payload);
    return res.data.data.campaign;
  },

  async update(id: string, payload: Partial<Campaign>): Promise<Campaign> {
    const res = await apiClient.patch<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}`, payload);
    return res.data.data.campaign;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/campaigns/${id}`);
  },

  async addActivity(id: string, activity: { title: string; content: string; image?: string; author?: string; date?: string }): Promise<Campaign> {
    const res = await apiClient.post<ApiResponse<{ campaign: Campaign }>>(`/campaigns/${id}/activities`, activity);
    return res.data.data.campaign;
  },
};
