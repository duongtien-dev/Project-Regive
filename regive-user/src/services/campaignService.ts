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
};
