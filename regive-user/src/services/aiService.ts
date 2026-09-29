import { apiClient } from './apiClient';
import { ApiResponse, AiDonationPreview } from '@/types';

export const aiService = {
  previewDonation: async (payload: {
    name: string;
    description?: string;
    category?: string;
    images?: string[];
    extraNote?: string;
  }): Promise<AiDonationPreview> => {
    const res = await apiClient.post<ApiResponse<AiDonationPreview>>(
      '/ai/preview-donation',
      payload
    );
    return res.data.data;
  },
};
