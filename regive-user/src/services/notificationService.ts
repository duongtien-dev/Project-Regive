import { apiClient } from './apiClient';
import { ApiResponse, Notification } from '@/types';

export const notificationService = {
  async listMine(params?: { unread?: boolean }): Promise<Notification[]> {
    const res = await apiClient.get<ApiResponse<{ notifications: Notification[] }>>(
      '/notifications',
      {
        params: params?.unread ? { unread: 'true' } : undefined,
      }
    );
    return res.data.data.notifications;
  },

  async markRead(id: string): Promise<Notification> {
    const res = await apiClient.patch<ApiResponse<{ notification: Notification }>>(
      `/notifications/${id}/read`
    );
    return res.data.data.notification;
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },
};
