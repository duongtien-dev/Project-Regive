'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Button, Alert, message, Result } from 'antd';
import { HandHeart, ArrowLeft, ShieldCheck } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { volunteerService } from '@/services/volunteerService';
import { Campaign, VolunteerRegistration } from '@/types';
import { AuthGuard } from '@/components/shared/AuthGuard';

export default function VolunteerRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<VolunteerRegistration | null>(null);

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

      const reg = await volunteerService.register({
        campaignId,
        skills: values.skills || '',
        availabilityNote: values.availabilityNote || '',
      });

      setRegistration(reg);
      message.success('Đăng ký tình nguyện viên thành công!');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi đăng ký');
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
          {registration ? (
            <Result
              status="success"
              title="Đăng Ký Tình Nguyện Viên Thành Công!"
              subTitle={
                <div className="text-gray-600 text-sm space-y-2 mt-2">
                  <p>Cảm ơn tinh thần tương thân tương ái của bạn!</p>
                  <p>
                    Hồ sơ đăng ký của bạn đang ở trạng thái:{' '}
                    <span className="font-bold text-orange-600">Chờ xét duyệt</span>
                  </p>
                  <div className="bg-sky-50 text-sky-800 p-4 rounded-xl text-xs text-left mt-4 leading-relaxed">
                    Điều phối viên chiến dịch sẽ kiểm tra kỹ năng và lịch rảnh của bạn, sau đó xếp lịch phân công cụ thể và thông báo qua mục "Đăng ký tình nguyện của tôi" trên ứng dụng.
                  </div>
                </div>
              }
              extra={[
                <Link key="me" href="/me/volunteers">
                  <Button type="primary" className="bg-sky-600">
                    Xem đăng ký của tôi
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
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <HandHeart className="w-4 h-4" />
                  <span>Chung tay sẻ chia</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900">Đăng Ký Tình Nguyện Viên</h1>
                {campaign && (
                  <p className="text-sm text-gray-500 mt-1">
                    Chiến dịch:{' '}
                    <span className="font-semibold text-gray-800">{campaign.title}</span>
                  </p>
                )}
              </div>

              {error && <Alert message="Lỗi" description={error} type="error" showIcon />}

              <Form layout="vertical" onFinish={handleSubmit} requiredMark="optional">
                <Form.Item
                  label="Kỹ năng hoặc thế mạnh của bạn"
                  name="skills"
                  rules={[{ required: true, message: 'Vui lòng chia sẻ kỹ năng của bạn' }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Ví dụ: Phân loại đồ đạc, đóng gói quà tặng, y tế cơ bản, chụp ảnh truyền thông, lái xe bán tải..."
                    className="!rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Thời gian và lịch rảnh có thể tham gia"
                  name="availabilityNote"
                  rules={[{ required: true, message: 'Vui lòng nêu thời gian có thể tham gia' }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Ví dụ: Rảnh các ngày Thứ Bảy và Chủ Nhật, hoặc các buổi chiều sau 17h..."
                    className="!rounded-xl"
                  />
                </Form.Item>

                <div className="pt-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                    className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-md shadow-sky-600/20"
                  >
                    Xác nhận đăng ký tham gia
                  </Button>
                </div>
              </Form>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Mọi hoạt động tình nguyện đều được hỗ trợ bảo hộ và hướng dẫn chu đáo.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
