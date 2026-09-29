'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Alert,
  message,
  Space,
} from 'antd';
import { Plus, Trash2, Sparkles, Building, Phone, Mail } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCampaign: Campaign) => void;
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

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.info('Vui lòng đăng nhập để đề xuất chiến dịch');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetItems = (values.targetItems || [])
        .filter((it: any) => it && it.name && it.targetQty)
        .map((it: any) => ({
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
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể tạo chiến dịch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="pb-3 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">
            {user?.role === 'ADMIN' ? 'Khởi Tạo Chiến Dịch Thiện Nguyện Mới' : 'Đề Xuất Chiến Dịch Thiện Nguyện Mới'}
          </h3>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Đăng ký thông tin chiến dịch gây quỹ, kêu gọi hiện vật và kết nối mạng lưới tình nguyện viên.
          </p>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={720}
      className="rounded-2xl"
    >
      <div className="py-4 space-y-4">
        {error && <Alert message="Lỗi tạo chiến dịch" description={error} type="error" showIcon />}

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
            <Input placeholder="Ví dụ: Áo Ấm Cho Em — Mùa Đông Vùng Cao 2026" size="large" className="!rounded-xl" />
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
                className="w-full !rounded-xl"
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
            label="Mục tiêu cụ thể (Hiển thị nổi bật)"
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
            label="Nội dung câu chuyện & Kế hoạch chi tiết"
            name="description"
            rules={[{ required: true, message: 'Vui lòng viết mô tả chi tiết' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Hoàn cảnh thực tế của bà con/các em, lịch trình chuyến đi, các đợt phát quà..."
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item label="Link ảnh bìa Banner chất lượng cao (URL)" name="bannerImage">
            <Input placeholder="https://images.unsplash.com/..." size="large" className="!rounded-xl" />
          </Form.Item>

          {/* Organization & Contact Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Thông tin đơn vị tổ chức & Đầu mối liên hệ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item label="Tên tổ chức / Đội nhóm" name="organization" className="!mb-2">
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

          {/* Volunteer Conditions */}
          <Form.Item label="Tiêu chuẩn / Điều kiện tham gia của Tình nguyện viên" name="volunteerConditions">
            <Input.TextArea
              rows={2}
              placeholder="Ví dụ: Trên 18 tuổi, có sức khỏe dẻo dai, ưu tiên có kinh nghiệm đi đường đèo dốc..."
              className="!rounded-xl"
            />
          </Form.Item>

          {/* Dynamic Target Physical Items Needed */}
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-teal-900">
                Vật phẩm hiện vật cần kêu gọi
              </h4>
              <span className="text-[11px] text-teal-700">(Không bắt buộc)</span>
            </div>
            <Form.List name="targetItems">
              {(fields, { add, remove }) => (
                <div className="space-y-2">
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} className="flex w-full" align="baseline">
                      <Form.Item {...restField} name={[name, 'name']} className="!mb-1">
                        <Input placeholder="Tên vật phẩm (vd: Áo khoác)" className="!rounded-xl w-44" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'targetQty']} className="!mb-1">
                        <InputNumber min={1} placeholder="Số lượng" className="!rounded-xl w-28" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'unit']} className="!mb-1">
                        <Input placeholder="Đơn vị (cái, bộ)" className="!rounded-xl w-24" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
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
                    + Thêm vật phẩm kêu gọi
                  </Button>
                </div>
              )}
            </Form.List>
          </div>

          <Form.Item label="Tags từ khóa (cách nhau bởi dấu phẩy)" name="tagsString">
            <Input placeholder="Vùng cao, Áo ấm, Bão lũ, Khẩn cấp..." size="large" className="!rounded-xl" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            size="large"
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
          >
            {user?.role === 'ADMIN' ? 'Khởi Tạo & Kích Hoạt Chiến Dịch' : 'Gửi Đề Xuất Phê Duyệt'}
          </Button>
        </Form>
      </div>
    </Modal>
  );
};
