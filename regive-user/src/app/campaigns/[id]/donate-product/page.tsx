'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, InputNumber, Button, Alert, message, Result } from 'antd';
import { Package, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { donationService } from '@/services/donationService';
import { Campaign, Donation } from '@/types';
import { AuthGuard } from '@/components/shared/AuthGuard';

export default function DonateProductPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdDonation, setCreatedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    campaignService
      .getById(campaignId)
      .then((c) => setCampaign(c))
      .catch((err) => setError(err.message || 'Không tìm thấy chiến dịch'));
  }, [campaignId]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      setError(null);

      const donation = await donationService.createDonation({
        campaignId,
        type: 'product',
        productInfo: {
          name: values.name,
          quantity: values.quantity || 1,
          description: values.description || '',
          conditionNote: values.conditionNote || '',
        },
        note: values.note || '',
      });

      setCreatedDonation(donation);
      message.success('Gửi đăng ký quyên góp hiện vật thành công!');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi thông tin');
    } finally {
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

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-lg">
          {createdDonation ? (
            <Result
              status="success"
              title="Đăng Ký Quyên Góp Thành Công!"
              subTitle={
                <div className="text-gray-600 text-sm space-y-2 mt-2">
                  <p>
                    Mã quyên góp của bạn là:{' '}
                    <strong className="text-emerald-700 font-mono">
                      {createdDonation._id}
                    </strong>
                  </p>
                  <p>
                    Vật phẩm: <strong>{createdDonation.productInfo?.name}</strong> (Số lượng:{' '}
                    {createdDonation.productInfo?.quantity})
                  </p>
                  <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs text-left mt-4 leading-relaxed">
                    <strong>Bước tiếp theo:</strong> Ban tổ chức ReGive sẽ liên hệ với bạn qua số điện thoại đã đăng ký để hướng dẫn gửi vật phẩm tới kho tiếp nhận hoặc điểm tập kết gần nhất.
                  </div>
                </div>
              }
              extra={[
                <Link key="me" href="/me/donations">
                  <Button type="primary" className="bg-emerald-600">
                    Xem lịch sử quyên góp
                  </Button>
                </Link>,
                <Link key="back" href={`/campaigns/${campaignId}`}>
                  <Button>Về chiến dịch</Button>
                </Link>,
              ]}
            />
          ) : (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-5">
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Package className="w-4 h-4" />
                  <span>Tuần hoàn vật phẩm</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900">Quyên Góp Hiện Vật</h1>
                {campaign && (
                  <p className="text-sm text-gray-500 mt-1">
                    Chiến dịch:{' '}
                    <span className="font-semibold text-gray-800">{campaign.title}</span>
                  </p>
                )}
              </div>

              {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

              <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ quantity: 1 }}
                requiredMark="optional"
              >
                <Form.Item
                  label="Tên vật phẩm quyên góp"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên vật phẩm' }]}
                >
                  <Input
                    placeholder="Ví dụ: Áo ấm mùa đông, Xe đạp học sinh, Bộ sách giáo khoa..."
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                >
                  <InputNumber min={1} max={1000} size="large" className="w-full !rounded-xl" />
                </Form.Item>

                <Form.Item label="Ghi chú về tình trạng vật phẩm" name="conditionNote">
                  <Input
                    placeholder="Ví dụ: Mới 90%, còn nguyên tem, đã giặt sạch sẽ..."
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item label="Mô tả chi tiết" name="description">
                  <Input.TextArea
                    rows={3}
                    placeholder="Kích thước, chủng loại, số lượng cụ thể từng món..."
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item label="Ghi chú thêm cho ban tiếp nhận" name="note">
                  <Input.TextArea
                    rows={2}
                    placeholder="Địa chỉ có thể giao nhận hoặc thời gian thuận tiện nhất cho bạn..."
                    className="!rounded-xl"
                  />
                </Form.Item>

                <div className="pt-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                    className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md shadow-teal-600/20"
                  >
                    Gửi thông tin quyên góp
                  </Button>
                </div>
              </Form>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Vật phẩm sẽ được nhân viên ReGive kiểm định và chuyển giao tận tay.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
