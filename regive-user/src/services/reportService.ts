import { apiClient } from './apiClient';
import { ApiResponse, PublicImpact } from '@/types';

export const reportService = {
  async getPublicImpact(): Promise<PublicImpact> {
    const res = await apiClient.get<ApiResponse<PublicImpact>>('/reports/public-impact');
    return res.data.data;
  },
};
