'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Tag } from 'antd';
import { Bell, CheckCheck, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/format';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.listMine(unreadOnly ? { unread: true } : undefined);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationLink = (n: Notification) => {
    if (n.type === 'donation') return '/me/donations';
    if (n.type === 'volunteer') return '/me/volunteers';
    if (n.type === 'order') return '/me/orders';
    if (n.type === 'support') return '/me/support-requests';
    return '/me/dashboard';
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-emerald-600" />
              <span>Thông Báo Của Bạn</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Cập nhật trạng thái quyên góp, tình nguyện và đơn hàng của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="small"
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={unreadOnly ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : ''}
            >
              {unreadOnly ? 'Xem tất cả' : 'Chỉ chưa đọc'}
            </Button>
            <Button
              size="small"
              icon={<CheckCheck className="w-3.5 h-3.5" />}
              onClick={handleMarkAllRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </div>

        {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

        {loading ? (
          <TableSkeleton rows={4} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="Không có thông báo mới"
            description="Bạn đã cập nhật tất cả thông tin mới nhất trên hệ thống."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const link = getNotificationLink(n);
              return (
                <div
                  key={n._id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.isRead
                      ? 'bg-white border-gray-100 text-gray-700'
                      : 'bg-emerald-50/40 border-emerald-200 text-gray-900 shadow-xs'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                      <Tag color="cyan" className="text-[10px] uppercase font-bold px-1.5 py-0">
                        {n.type}
                      </Tag>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(n.createdAt)}</span>
                      </span>

                      <Link
                        href={link}
                        className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                        onClick={() => !n.isRead && handleMarkRead(n._id)}
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {!n.isRead && (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => handleMarkRead(n._id)}
                      title="Đánh dấu đã đọc"
                      className="text-xs text-gray-400 hover:text-emerald-600 shrink-0"
                    >
                      Đã đọc
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
