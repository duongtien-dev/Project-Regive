'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, InputNumber, Button, Alert, message, Result, Select, Checkbox } from 'antd';
import { Package, ArrowLeft, ShieldCheck, CheckCircle, Info, Sparkles } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { donationService } from '@/services/donationService';
import { Campaign, Donation } from '@/types';
import { AuthGuard } from '@/components/shared/AuthGuard';

const PRODUCT_CATEGORIES = [
  { value: 'clothing', label: 'Quần áo ấm & Thời trang' },
  { value: 'books_stationery', label: 'Sách giáo khoa, truyện & Vở viết' },
  { value: 'electronics', label: 'Thiết bị điện tử & Gia dụng' },
  { value: 'toys', label: 'Đồ chơi & Bộ phát triển trí tuệ' },
  { value: 'essentials', label: 'Nhu yếu phẩm & Đồ khô' },
  { value: 'other', label: 'Khác' },
];

export default function DonateProductPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
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

      const images = values.imageUrl ? [values.imageUrl.trim()] : [];

      const donation = await donationService.createDonation({
        campaignId,
        type: 'product',
        isAnonymous,
        productInfo: {
          name: values.name,
          category: values.category || 'other',
          quantity: values.quantity || 1,
          description: values.description || '',
          conditionNote: values.conditionNote || '',
          estimatedValue: values.estimatedValue || 0,
          images,
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

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl">
          {createdDonation ? (
            <Result
              status="success"
              title="Đăng Ký Quyên Góp Hiện Vật Thành Công!"
              subTitle={
                <div className="text-gray-600 text-sm space-y-3 mt-3">
                  <p>
                    Mã quyên góp của bạn là:{' '}
                    <strong className="text-emerald-700 font-mono text-base">
                      {createdDonation._id}
                    </strong>
                  </p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-1.5 text-xs text-gray-700">
                    <div>
                      <strong>Vật phẩm:</strong> {createdDonation.productInfo?.name}
                    </div>
                    <div>
                      <strong>Số lượng:</strong> {createdDonation.productInfo?.quantity}
                    </div>
                    {createdDonation.productInfo?.conditionNote && (
                      <div>
                        <strong>Tình trạng:</strong> {createdDonation.productInfo?.conditionNote}
                      </div>
                    )}
                  </div>
                  <div className="bg-teal-50 text-teal-900 p-4 rounded-2xl text-xs text-left leading-relaxed border border-teal-200">
                    <strong className="flex items-center gap-1 mb-1 font-bold text-teal-950">
                      <Sparkles className="w-3.5 h-3.5" />
                      Quy trình tiếp nhận tiếp theo:
                    </strong>
                    Điều phối viên kho ReGive sẽ liên hệ với bạn qua số điện thoại tài khoản trong vòng 24h để xác nhận phương thức vận chuyển hoặc điểm tập kết vật phẩm gần bạn nhất.
                  </div>
                </div>
              }
              extra={[
                <Link key="me" href="/me/donations">
                  <Button type="primary" className="bg-emerald-600 rounded-xl h-11 px-6 font-bold">
                    Xem lịch sử quyên góp
                  </Button>
                </Link>,
                <Link key="back" href={`/campaigns/${campaignId}`}>
                  <Button className="rounded-xl h-11 px-6">Về chiến dịch</Button>
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
                  <div className="mt-2 p-3 bg-teal-50/60 rounded-xl border border-teal-100/80">
                    <p className="text-xs text-teal-800 font-medium">Chiến dịch tiếp nhận:</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{campaign.title}</p>
                  </div>
                )}
              </div>

              {/* Guidelines banner */}
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Tiêu chuẩn vật phẩm tiếp nhận ReGive:</p>
                  <p>
                    Vật phẩm cần còn sử dụng tốt (độ mới từ 70% trở lên), đã được giặt sạch hoặc vệ sinh cẩn thận. Không gửi các đồ vật dễ cháy nổ, đồ ăn ôi thiu hoặc đồ đã hư hỏng nặng.
                  </p>
                </div>
              </div>

              {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

              <Form
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ quantity: 1, category: 'clothing' }}
                requiredMark="optional"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item
                    label="Danh mục vật phẩm"
                    name="category"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select options={PRODUCT_CATEGORIES} size="large" className="!rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="Số lượng"
                    name="quantity"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber min={1} max={1000} size="large" className="w-full !rounded-xl" />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Tên vật phẩm quyên góp"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên vật phẩm' }]}
                >
                  <Input
                    placeholder="Ví dụ: Áo khoác lông vũ mùa đông, 10 Bộ sách giáo khoa lớp 4..."
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Form.Item label="Tình trạng vật phẩm" name="conditionNote">
                    <Input
                      placeholder="Ví dụ: Mới 95%, nguyên cúc áo, đã giặt thơm..."
                      size="large"
                      className="!rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item label="Giá trị ước tính (VND)" name="estimatedValue">
                    <InputNumber
                      min={0}
                      step={50000}
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      placeholder="Ví dụ: 300,000"
                      size="large"
                      className="w-full !rounded-xl"
                    />
                  </Form.Item>
                </div>

                <Form.Item label="Link ảnh chụp thực tế (nếu có)" name="imageUrl">
                  <Input
                    placeholder="Dán link ảnh (Unsplash, Imgur, Google Drive public...)"
                    size="large"
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item label="Mô tả chi tiết" name="description">
                  <Input.TextArea
                    rows={3}
                    placeholder="Màu sắc, kích thước, các đặc điểm cần lưu ý..."
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item label="Ghi chú giao nhận / thời gian liên hệ thuận tiện" name="note">
                  <Input.TextArea
                    rows={2}
                    placeholder="Địa chỉ quận/huyện hoặc khung giờ bạn có thể nghe máy..."
                    className="!rounded-xl"
                  />
                </Form.Item>

                {/* Anonymous Option */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl mb-4">
                  <Checkbox
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="text-xs font-bold text-gray-800"
                  >
                    Ủng hộ ẩn danh trên Bảng vàng đóng góp
                  </Checkbox>
                </div>

                <div className="pt-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                    className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/25"
                  >
                    Xác nhận gửi thông tin quyên góp
                  </Button>
                </div>
              </Form>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Vật phẩm sẽ được nhân viên ReGive kiểm định và chuyển giao minh bạch.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
