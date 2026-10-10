import { apiClient } from './apiClient';
import { ApiResponse, Comment, CommentTargetType } from '@/types';

export const commentService = {
  async list(
    targetType: CommentTargetType,
    targetId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ comments: Comment[]; total: number }> {
    const res = await apiClient.get<ApiResponse<{ comments: Comment[]; total: number }>>(
      '/comments',
      { params: { targetType, targetId, ...params } }
    );
    return res.data.data;
  },

  async create(targetType: CommentTargetType, targetId: string, content: string): Promise<Comment> {
    const res = await apiClient.post<ApiResponse<{ comment: Comment }>>('/comments', {
      targetType,
      targetId,
      content,
    });
    return res.data.data.comment;
  },

  async toggleLike(commentId: string): Promise<Comment> {
    const res = await apiClient.post<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}/like`
    );
    return res.data.data.comment;
  },

  async remove(commentId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/comments/${commentId}`);
  },
};
