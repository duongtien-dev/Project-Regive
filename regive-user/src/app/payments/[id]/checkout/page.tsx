'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Alert, message, Result, Tabs } from 'antd';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Info,
  Gift,
  Package,
  QrCode,
  Copy,
  Sparkles,
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

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      message.success(`Đã sao chép ${label}!`);
    }
  };

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

  const qrData = `2|99|0909REGIVE2026|QUY THIEN NGUYEN REGIVE VIETNAM||0|0|${payment?.amount || 0}|REGIVE ${payment?.paymentCode}|transfer_myqr`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl space-y-6">
          {confirmed || payment?.status === 'success' ? (
            <Result
              status="success"
              title="Thanh Toán Quyên Góp Thành Công!"
              subTitle={
                <div className="text-sm text-gray-600 space-y-3 mt-3">
                  <p>
                    Giao dịch <strong className="font-mono text-gray-900">{payment?.paymentCode}</strong> đã được ghi nhận trực tiếp vào hệ thống cơ sở dữ liệu ReGive.
                  </p>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-bold text-lg inline-block">
                    Số tiền đóng góp: {formatVND(payment?.amount)}
                  </div>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Sự hỗ trợ của bạn đã trực tiếp tiếp sức cho hành trình lan tỏa yêu thương. Toàn bộ thông tin được cập nhật tức thì trên Bảng vàng đóng góp của chiến dịch.
                  </p>
                </div>
              }
              extra={[
                payment?.purpose === 'donation' ? (
                  <Link key="donation" href="/me/donations">
                    <Button type="primary" className="bg-emerald-600 rounded-xl h-11 px-6 font-bold">
                      Xem lịch sử quyên góp
                    </Button>
                  </Link>
                ) : (
                  <Link key="order" href="/me/orders">
                    <Button type="primary" className="bg-emerald-600 rounded-xl h-11 px-6 font-bold">
                      Xem đơn hàng của tôi
                    </Button>
                  </Link>
                ),
                <Link key="home" href="/">
                  <Button className="rounded-xl h-11 px-6">Về trang chủ</Button>
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
                <h1 className="text-2xl font-black text-gray-900">Cổng Thanh Toán ReGive Sandbox</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Môi trường mô phỏng thanh toán an toàn, minh bạch theo tiêu chuẩn VietQR & MoMo
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
                    {payment?.purpose === 'donation' ? 'Quyên góp chiến dịch thiện nguyện' : 'Mua vật phẩm gây quỹ'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Trạng thái hiện tại:</span>
                  <StatusBadge type="payment" status={payment?.status} />
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center">
                  <span className="font-bold text-gray-700">Tổng tiền cần thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {formatVND(payment?.amount)}
                  </span>
                </div>
              </div>

              {/* Payment Methods Simulation */}
              <Tabs
                defaultActiveKey="vietqr"
                items={[
                  {
                    key: 'vietqr',
                    label: 'Quét mã VietQR (Khuyên dùng)',
                    children: (
                      <div className="pt-2 space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
                          {/* QR preview */}
                          <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 shrink-0 text-center">
                            <img src={qrUrl} alt="VietQR" className="w-44 h-44 mx-auto rounded-lg" />
                            <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                              Quét bằng ứng dụng Ngân hàng
                            </span>
                          </div>

                          {/* Bank account details */}
                          <div className="flex-1 space-y-2.5 text-xs text-gray-700 w-full">
                            <div>
                              <span className="text-gray-400 block text-[11px]">Ngân hàng thụ hưởng:</span>
                              <strong className="text-gray-900 text-sm">MB Bank (Ngân hàng Quân Đội)</strong>
                            </div>

                            <div>
                              <span className="text-gray-400 block text-[11px]">Số tài khoản:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-extrabold text-base text-emerald-800">
                                  0909REGIVE2026
                                </span>
                                <Button
                                  size="small"
                                  icon={<Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy('0909REGIVE2026', 'Số tài khoản')}
                                  className="h-6 px-2 text-[10px]"
                                >
                                  Sao chép
                                </Button>
                              </div>
                            </div>

                            <div>
                              <span className="text-gray-400 block text-[11px]">Tên chủ tài khoản:</span>
                              <strong className="text-gray-900">QUY THIEN NGUYEN REGIVE VIETNAM</strong>
                            </div>

                            <div>
                              <span className="text-gray-400 block text-[11px]">Nội dung chuyển khoản:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded-md border border-emerald-200">
                                  REGIVE {payment?.paymentCode}
                                </span>
                                <Button
                                  size="small"
                                  icon={<Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy(`REGIVE ${payment?.paymentCode}`, 'Nội dung CK')}
                                  className="h-6 px-2 text-[10px]"
                                >
                                  Sao chép
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            type="primary"
                            size="large"
                            loading={submitting}
                            onClick={handleConfirmPayment}
                            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25"
                          >
                            Xác nhận đã chuyển khoản ({formatVND(payment?.amount)})
                          </Button>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'sandbox_direct',
                    label: 'Xác nhận Sandbox Token trực tiếp',
                    children: (
                      <div className="pt-2 space-y-4">
                        <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 text-xs text-sky-900 space-y-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Info className="w-4 h-4 text-sky-600" />
                            <span>Mô phỏng Sandbox Token:</span>
                          </div>
                          <p className="leading-relaxed">
                            Mã xác thực Sandbox đã được tự động điền. Nhấn xác nhận để kích hoạt thanh toán thành công tức thì.
                          </p>
                        </div>

                        <div className="space-y-1.5">
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

                        <Button
                          type="primary"
                          size="large"
                          loading={submitting}
                          onClick={handleConfirmPayment}
                          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
                        >
                          Xác nhận Sandbox Token ({formatVND(payment?.amount)})
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Môi trường Sandbox không trừ tiền thật. Đảm bảo toàn vẹn dữ liệu cho đồ án ReGive.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
