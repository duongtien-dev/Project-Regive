import { apiClient } from './apiClient';
import { ApiResponse, Product } from '@/types';

export const marketplaceService = {
  async listMarketplace(params?: { category?: string; condition?: string }): Promise<Product[]> {
    const res = await apiClient.get<ApiResponse<{ products: Product[] }>>('/products/marketplace', {
      params,
    });
    return res.data.data.products;
  },

  async getMarketplaceDetail(id: string): Promise<Product> {
    const res = await apiClient.get<ApiResponse<{ product: Product }>>(
      `/products/marketplace/${id}`
    );
    return res.data.data.product;
  },
};
