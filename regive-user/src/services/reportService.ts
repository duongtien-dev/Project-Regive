import { apiClient } from './apiClient';
import { ApiResponse, PublicImpact, TransparencyLedgerData } from '@/types';

export const reportService = {
  async getPublicImpact(): Promise<PublicImpact> {
    const res = await apiClient.get<ApiResponse<PublicImpact>>('/reports/public-impact');
    return res.data.data;
  },

  async getTransparencyLedger(): Promise<TransparencyLedgerData> {
    const res = await apiClient.get<ApiResponse<TransparencyLedgerData>>('/reports/transparency-ledger');
    return res.data.data;
  },
};
