'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Alert, message, Result, Card } from 'antd';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Info,
  Gift,
  Package,
} from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/types';
import { formatVND, formatDate } from '@/lib/format';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DetailSkeleton } from '@/components/shared/LoadingSkeleton';

export default function PaymentCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [sandboxToken, setSandboxToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getById(id);
      setPayment(data);
      if (data.sandboxToken) {
        setSandboxToken(data.sandboxToken);
      }
      if (data.status === 'success') {
        setConfirmed(true);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPayment();
  }, [id]);

  const handleConfirmPayment = async () => {
    if (!sandboxToken.trim()) {
      message.error('Vui lòng nhập sandboxToken để xác nhận thanh toán thử nghiệm');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const updated = await paymentService.confirmSandbox({
        paymentId: id,
        sandboxToken: sandboxToken.trim(),
      });

      setPayment(updated);
      setConfirmed(true);
      message.success('Thanh toán thành công qua Sandbox!');
    } catch (err: any) {
      setError(err.message || 'Xác nhận thanh toán thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <DetailSkeleton />
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <Alert
          message="Không tìm thấy thanh toán"
          description={error}
          type="error"
          showIcon
          action={
            <Link href="/me/dashboard">
              <Button size="small">Về Dashboard</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl space-y-6">
          {confirmed || payment?.status === 'success' ? (
            <Result
              status="success"
              title="Thanh Toán Thành Công!"
              subTitle={
                <div className="text-sm text-gray-600 space-y-2 mt-2">
                  <p>
                    Giao dịch <strong className="font-mono">{payment?.paymentCode}</strong> đã được ghi nhận vào hệ thống ReGive.
                  </p>
                  <p className="text-emerald-700 font-bold text-lg">
                    Số tiền: {formatVND(payment?.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Cảm ơn bạn đã đồng hành và ủng hộ cộng đồng!
                  </p>
                </div>
              }
              extra={[
                payment?.purpose === 'donation' ? (
                  <Link key="donation" href="/me/donations">
                    <Button type="primary" className="bg-emerald-600">
                      Xem lịch sử quyên góp
                    </Button>
                  </Link>
                ) : (
                  <Link key="order" href="/me/orders">
                    <Button type="primary" className="bg-emerald-600">
                      Xem đơn hàng của tôi
                    </Button>
                  </Link>
                ),
                <Link key="home" href="/">
                  <Button>Về trang chủ</Button>
                </Link>,
              ]}
            />
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <CreditCard className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-gray-900">Cổng Thanh Toán Sandbox</h1>
                <p className="text-xs text-gray-400 mt-1">
                  Môi trường mô phỏng thanh toán an toàn của ReGive
                </p>
              </div>

              {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

              {/* Transaction details card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mã giao dịch:</span>
                  <span className="font-mono font-bold text-gray-800">{payment?.paymentCode}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mục đích:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {payment?.purpose === 'donation' ? 'Quyên góp chiến dịch' : 'Mua vật phẩm marketplace'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trạng thái:</span>
                  <StatusBadge type="payment" status={payment?.status} />
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {formatVND(payment?.amount)}
                  </span>
                </div>
              </div>

              {/* Sandbox instructions */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 text-xs text-sky-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-sky-600" />
                  <span>Hướng dẫn thử nghiệm Sandbox:</span>
                </div>
                <p className="leading-relaxed">
                  Hệ thống đang hoạt động ở chế độ Sandbox. Token xác thực đã được tự động điền bên dưới nếu bạn là người tạo giao dịch. Nhấn nút <strong>"Xác nhận thanh toán Sandbox"</strong> để hoàn tất.
                </p>
              </div>

              {/* Sandbox Token Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700">
                  Sandbox Token xác thực:
                </label>
                <Input
                  value={sandboxToken}
                  onChange={(e) => setSandboxToken(e.target.value)}
                  placeholder="Nhập hoặc dán sandboxToken tại đây..."
                  size="large"
                  className="font-mono text-xs !rounded-xl"
                />
              </div>

              {/* Confirm Button */}
              <div className="pt-2">
                <Button
                  type="primary"
                  size="large"
                  loading={submitting}
                  onClick={handleConfirmPayment}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
                >
                  Xác nhận thanh toán Sandbox ({formatVND(payment?.amount)})
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Không mất tiền thật. Dùng để kiểm thử luồng quyên góp và đặt hàng.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
