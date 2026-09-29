'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Tag } from 'antd';
import { CreditCard, RefreshCw, ArrowRight } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/types';
import { formatVND, formatDate } from '@/lib/format';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getMyPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <DashboardLayout
      title="Lịch Sử Thanh Toán"
      subtitle="Quản lý toàn bộ các giao dịch thanh toán quyên góp và mua sắm của bạn"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button icon={<RefreshCw className="w-4 h-4" />} onClick={fetchPayments}>
            Làm mới
          </Button>
        </div>

        {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

        {loading ? (
          <TableSkeleton rows={4} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="Chưa có giao dịch thanh toán nào"
            description="Lịch sử các phiên thanh toán tiền quyên góp hoặc đơn hàng sẽ hiển thị tại đây."
          />
        ) : (
          <div className="space-y-3">
            {payments.map((p) => {
              const paymentId = p.id || p._id;
              return (
                <div
                  key={paymentId}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900 text-sm">
                        {p.paymentCode}
                      </span>
                      <StatusBadge type="payment" status={p.status} />
                      <Tag color="geekblue" className="text-[10px] uppercase font-bold">
                        {p.purpose === 'donation' ? 'Quyên góp' : 'Đơn hàng'}
                      </Tag>
                    </div>

                    <p className="text-xs text-gray-400">
                      Cổng: <span className="font-medium text-gray-600">{p.provider || 'Sandbox'}</span> • Ngày tạo: {formatDate(p.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-emerald-700">
                      {formatVND(p.amount)}
                    </span>

                    {p.status === 'pending' ? (
                      <Link href={`/payments/${paymentId}/checkout`}>
                        <Button
                          type="primary"
                          size="small"
                          className="bg-emerald-600 rounded-lg text-xs"
                        >
                          Thanh toán ngay
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/payments/${paymentId}/checkout`}>
                        <Button size="small" className="rounded-lg text-xs">
                          Xem chi tiết
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
