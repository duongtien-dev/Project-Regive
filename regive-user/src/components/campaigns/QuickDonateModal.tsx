'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Form, Input, Button, Checkbox, message, Alert } from 'antd';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { donationService } from '@/services/donationService';
import { paymentService } from '@/services/paymentService';
import { Campaign } from '@/types';
import { MoneyInput } from '@/components/shared/MoneyInput';
import { formatVND } from '@/lib/format';
import { useAuthStore } from '@/store/useAuthStore';

interface QuickDonateModalProps {
  campaign: Campaign | null;
  open: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

export const QuickDonateModal: React.FC<QuickDonateModalProps> = ({
  campaign,
  open,
  onClose,
  defaultAmount = 100000,
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!campaign) return null;

  const handleSubmit = async (values: { note?: string }) => {
    if (!user) {
      message.info('Vui lòng đăng nhập để tiến hành quyên góp');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!amount || amount < 10000) {
      message.error('Số tiền tối thiểu là 10.000 VND');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. Create Donation
      const donation = await donationService.createDonation({
        campaignId: campaign._id,
        type: 'money',
        amount,
        isAnonymous,
        note: values.note,
      });

      // 2. Create Payment
      const payment = await paymentService.create({
        purpose: 'donation',
        donationId: donation._id,
      });

      message.success('Tạo giao dịch thành công. Đang chuyển đến cổng thanh toán Sandbox...');
      onClose();

      const paymentId = payment.id || payment._id;
      window.location.href = payment.checkoutUrl || `/payments/${paymentId}/checkout`;
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo giao dịch quyên góp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Heart className="w-4 h-4 fill-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">Ủng Hộ Tiền Nhanh</h3>
            <p className="text-xs text-gray-500 font-normal truncate max-w-sm">
              Chiến dịch: <span className="font-semibold text-gray-800">{campaign.title}</span>
            </p>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      className="rounded-2xl"
    >
      <div className="py-3 space-y-4">
        {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

        <Form layout="vertical" onFinish={handleSubmit} requiredMark="optional">
          <Form.Item label="Chọn hoặc nhập số tiền (VND)" required>
            <MoneyInput value={amount} onChange={(val) => setAmount(val || 0)} min={10000} />
          </Form.Item>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mb-4">
            <Checkbox
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="text-xs font-bold text-gray-800"
            >
              Ủng hộ ẩn danh trên Bảng vàng đóng góp
            </Checkbox>
          </div>

          <Form.Item label="Lời nhắn gửi (không bắt buộc)" name="note">
            <Input.TextArea
              rows={2}
              placeholder="Gửi lời chúc, nhắn nhủ đến các em nhỏ và ban tổ chức..."
              maxLength={250}
              className="!rounded-xl"
            />
          </Form.Item>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-gray-700 mb-4">
            <span>Tổng tiền ủng hộ:</span>
            <span className="text-xl font-black text-emerald-700">{formatVND(amount)}</span>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            size="large"
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
          >
            Tiến hành thanh toán {formatVND(amount)}
          </Button>
        </Form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Giao dịch an toàn & minh bạch 100% qua ReGive Sandbox.</span>
        </div>
      </div>
    </Modal>
  );
};
