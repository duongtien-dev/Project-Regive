'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, DatePicker, Form, Input, InputNumber, message, Select, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { useAuthStore } from '@/store/useAuthStore';
import { Campaign } from '@/types';

interface CreateCampaignFormProps {
  onSuccess?: (newCampaign: Campaign) => void;
}

interface TargetItemInput {
  name?: string;
  targetQty?: number | null;
  unit?: string;
}

interface CreateCampaignFormValues {
  title: string;
  shortDescription?: string;
  description: string;
  goal: string;
  location: string;
  category?: string;
  targetAmount?: number | null;
  dateRange: [Dayjs, Dayjs];
  bannerImage?: string;
  organization?: string;
  representative?: string;
  phone?: string;
  email?: string;
  volunteerConditions?: string;
  targetItems?: TargetItemInput[];
  tagsString?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'children', label: 'Trẻ em & Áo ấm vùng cao' },
  { value: 'disaster_relief', label: 'Cứu trợ bão lũ & Thiên tai' },
  { value: 'poverty_alleviation', label: 'Bữa cơm yêu thương & Người nghèo' },
  { value: 'education', label: 'Tủ sách tri thức & Giáo dục' },
  { value: 'environment', label: 'Nước sạch & Môi trường sống' },
  { value: 'healthcare', label: 'Y tế cộng đồng & Nụ cười trẻ thơ' },
  { value: 'other', label: 'Khác' },
];

export const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form] = Form.useForm<CreateCampaignFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown) => {
    return err instanceof Error ? err.message : 'Không thể tạo chiến dịch';
  };

  const handleSubmit = async (values: CreateCampaignFormValues) => {
    if (!user) {
      message.info('Vui lòng đăng nhập để đề xuất chiến dịch');
      router.push(`/login?redirect=${encodeURIComponent('/campaigns/create')}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetItems = (values.targetItems || [])
        .filter((it): it is TargetItemInput & { name: string; targetQty: number } => Boolean(it?.name && it?.targetQty))
        .map((it) => ({
          name: it.name.trim(),
          targetQty: Number(it.targetQty),
          receivedQty: 0,
          unit: it.unit || 'món',
        }));

      const tags = values.tagsString
        ? values.tagsString
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
        : [];

      const payload: Partial<Campaign> = {
        title: values.title,
        shortDescription: values.shortDescription || '',
        description: values.description,
        goal: values.goal,
        location: values.location,
        category: values.category || 'other',
        targetAmount: values.targetAmount || 0,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        bannerImage:
          values.bannerImage ||
          'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
        organization: values.organization || user.fullName,
        contactInfo: {
          representative: values.representative || user.fullName,
          phone: values.phone || user.phone || '',
          email: values.email || user.email || '',
        },
        volunteerConditions: values.volunteerConditions || '',
        targetItems,
        tags,
      };

      const created = await campaignService.create(payload);
      message.success('Đề xuất chiến dịch thiện nguyện thành công!');
      form.resetFields();
      onSuccess?.(created);
      router.push(created?._id ? `/campaigns/${created._id}` : '/campaigns');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 sm:px-7 py-5 border-b border-gray-100 bg-slate-50/70">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Đề xuất chiến dịch</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-950">
          {user?.role === 'ADMIN' ? 'Khởi tạo chiến dịch thiện nguyện mới' : 'Đề xuất chiến dịch thiện nguyện mới'}
        </h2>
        <p className="text-sm text-gray-600 mt-1 max-w-3xl">
          Đăng ký thông tin chiến dịch gây quỹ, kêu gọi hiện vật và kết nối mạng lưới tình nguyện viên.
        </p>
      </div>

      <div className="p-5 sm:p-7">
        {error && (
          <Alert
            message="Lỗi tạo chiến dịch"
            description={error}
            type="error"
            showIcon
            className="mb-5"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: 'children',
            organization: user?.fullName ? `Ban Thiện Nguyện ${user.fullName}` : '',
            representative: user?.fullName || '',
            phone: user?.phone || '',
            email: user?.email || '',
            targetItems: [{ name: '', targetQty: 100, unit: 'chiếc' }],
          }}
          requiredMark="optional"
        >
          <Form.Item
            label="Tên chiến dịch"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tên chiến dịch' }]}
          >
            <Input placeholder="Ví dụ: Áo Ấm Cho Em - Mùa Đông Vùng Cao 2026" size="large" className="!rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label="Danh mục hoạt động"
              name="category"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select options={CATEGORY_OPTIONS} size="large" className="!rounded-xl" />
            </Form.Item>

            <Form.Item
              label="Địa điểm thực hiện"
              name="location"
              rules={[{ required: true, message: 'Vui lòng nhập địa điểm (huyện, tỉnh)' }]}
            >
              <Input placeholder="Ví dụ: Đồng Văn, Hà Giang" size="large" className="!rounded-xl" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label="Mục tiêu gây quỹ tiền mặt (VND)"
              name="targetAmount"
              rules={[{ required: true, message: 'Vui lòng nhập số tiền mục tiêu' }]}
            >
              <InputNumber
                min={0}
                step={1000000}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                placeholder="Ví dụ: 100,000,000"
                size="large"
                className="!w-full !rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label="Thời gian diễn ra"
              name="dateRange"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
            >
              <DatePicker.RangePicker size="large" className="w-full !rounded-xl" />
            </Form.Item>
          </div>

          <Form.Item
            label="Mục tiêu cụ thể"
            name="goal"
            rules={[{ required: true, message: 'Vui lòng nhập mục tiêu ngắn hạn' }]}
          >
            <Input
              placeholder="Ví dụ: Trao tặng 1.200 bộ áo ấm và 500 chăn bông cho học sinh nghèo."
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item label="Mô tả tóm tắt (1-2 câu)" name="shortDescription">
            <Input placeholder="Tóm tắt ngắn gọn để hiển thị trên thẻ chiến dịch..." className="!rounded-xl" />
          </Form.Item>

          <Form.Item
            label="Nội dung câu chuyện & kế hoạch chi tiết"
            name="description"
            rules={[{ required: true, message: 'Vui lòng viết mô tả chi tiết' }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="Hoàn cảnh thực tế, lịch trình chuyến đi, các đợt phát quà..."
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item label="Link ảnh bìa banner chất lượng cao (URL)" name="bannerImage">
            <Input placeholder="https://images.unsplash.com/..." size="large" className="!rounded-xl" />
          </Form.Item>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Thông tin đơn vị tổ chức & đầu mối liên hệ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item label="Tên tổ chức / đội nhóm" name="organization" className="!mb-2">
                <Input placeholder="Ví dụ: CLB Trái Tim Hồng" className="!rounded-xl" />
              </Form.Item>
              <Form.Item label="Đại diện liên hệ" name="representative" className="!mb-2">
                <Input placeholder="Họ và tên người đại diện" className="!rounded-xl" />
              </Form.Item>
              <Form.Item label="Số điện thoại liên hệ" name="phone" className="!mb-2">
                <Input placeholder="09xxxxxxxx" className="!rounded-xl" />
              </Form.Item>
              <Form.Item label="Email liên hệ" name="email" className="!mb-2">
                <Input placeholder="contact@clb.org.vn" className="!rounded-xl" />
              </Form.Item>
            </div>
          </div>

          <Form.Item label="Tiêu chuẩn / điều kiện tham gia của tình nguyện viên" name="volunteerConditions">
            <Input.TextArea
              rows={2}
              placeholder="Ví dụ: Trên 18 tuổi, có sức khỏe dẻo dai, ưu tiên có kinh nghiệm đi đường đèo dốc..."
              className="!rounded-xl"
            />
          </Form.Item>

          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-2 mb-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-teal-900">
                Vật phẩm hiện vật cần kêu gọi
              </h3>
              <span className="text-[11px] text-teal-700 whitespace-nowrap">Không bắt buộc</span>
            </div>
            <Form.List name="targetItems">
              {(fields, { add, remove }) => (
                <div className="space-y-2">
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} className="flex w-full flex-wrap" align="baseline">
                      <Form.Item {...restField} name={[name, 'name']} className="!mb-1">
                        <Input placeholder="Tên vật phẩm" className="!rounded-xl w-44" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'targetQty']} className="!mb-1">
                        <InputNumber min={1} placeholder="Số lượng" className="!rounded-xl w-28" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'unit']} className="!mb-1">
                        <Input placeholder="Đơn vị" className="!rounded-xl w-24" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        aria-label="Xóa vật phẩm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<Plus className="w-4 h-4" />}
                    className="rounded-xl border-teal-300 text-teal-800"
                  >
                    Thêm vật phẩm kêu gọi
                  </Button>
                </div>
              )}
            </Form.List>
          </div>

          <Form.Item label="Tags từ khóa (cách nhau bởi dấu phẩy)" name="tagsString">
            <Input placeholder="Vùng cao, Áo ấm, Bão lũ, Khẩn cấp..." size="large" className="!rounded-xl" />
          </Form.Item>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button size="large" className="rounded-xl" onClick={() => router.push('/campaigns')}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
            >
              {user?.role === 'ADMIN' ? 'Khởi tạo & kích hoạt chiến dịch' : 'Gửi đề xuất phê duyệt'}
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
};
