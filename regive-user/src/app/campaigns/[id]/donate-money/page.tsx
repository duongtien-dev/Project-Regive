'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Alert, message } from 'antd';
import { Heart, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { donationService } from '@/services/donationService';
import { paymentService } from '@/services/paymentService';
import { Campaign } from '@/types';
import { MoneyInput } from '@/components/shared/MoneyInput';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { formatVND } from '@/lib/format';

export default function DonateMoneyPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState<number>(100000);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    campaignService
      .getById(campaignId)
      .then((c) => setCampaign(c))
      .catch((err) => setError(err.message || 'Không tìm thấy chiến dịch'))
      .finally(() => setLoadingCampaign(false));
  }, [campaignId]);

  const handleSubmit = async (values: { note?: string }) => {
    if (!amount || amount < 10000) {
      message.error('Số tiền tối thiểu là 10.000 VND');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. Create Donation
      const donation = await donationService.createDonation({
        campaignId,
        type: 'money',
        amount,
        note: values.note,
      });

      // 2. Create Payment for Donation
      const payment = await paymentService.create({
        purpose: 'donation',
        donationId: donation._id,
      });

      message.success('Tạo yêu cầu quyên góp thành công. Đang chuyển đến cổng thanh toán...');

      // 3. Redirect to Sandbox Checkout
      const paymentId = payment.id || payment._id;
      router.push(`/payments/${paymentId}/checkout`);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo giao dịch quyên góp');
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div>
          <Link
            href={`/campaigns/${campaignId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại chi tiết chiến dịch</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-lg space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 fill-emerald-600" />
              <span>Ủng hộ tài chính</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Quyên Góp Tiền Mặt</h1>
            {campaign && (
              <p className="text-sm text-gray-500 mt-1">
                Chiến dịch:{' '}
                <span className="font-semibold text-gray-800">{campaign.title}</span>
              </p>
            )}
          </div>

          {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

          <Form layout="vertical" onFinish={handleSubmit} requiredMark="optional">
            {/* Amount Input with Presets */}
            <Form.Item label="Chọn hoặc nhập số tiền ủng hộ (VND)" required>
              <MoneyInput
                value={amount}
                onChange={(val) => setAmount(val || 0)}
                min={10000}
              />
            </Form.Item>

            {/* Note */}
            <Form.Item label="Lời nhắn gửi (không bắt buộc)" name="note">
              <Input.TextArea
                rows={3}
                placeholder="Gửi lời chúc, nhắn nhủ đến các hoàn cảnh hoặc ban tổ chức chiến dịch..."
                maxLength={300}
                showCount
                className="!rounded-xl"
              />
            </Form.Item>

            {/* Summary preview */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>Số tiền quyên góp:</span>
                <span className="text-base font-extrabold text-emerald-700">
                  {formatVND(amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Phương thức thanh toán:</span>
                <span>Cổng thanh toán Sandbox</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-600/20"
              >
                Tiến hành thanh toán {formatVND(amount)}
              </Button>
            </div>
          </Form>

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Khoản tiền sẽ được chuyển thẳng vào quỹ chiến dịch sau khi thanh toán.</span>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
