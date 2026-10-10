'use client';

import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Alert, message, Card } from 'antd';
import { User, Phone, MapPin, Mail, Users, Save, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/format';

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (values: any) => {
    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        fullName: values.fullName,
        phone: values.phone,
        address: values.address,
      };

      if (user?.role === 'BENEFICIARY') {
        payload.beneficiaryInfo = {
          householdSize: values.householdSize,
          note: values.note,
        };
      }

      await updateProfile(payload);
      message.success('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Cài Đặt Tài Khoản"
      subtitle="Quản lý và cập nhật thông tin cá nhân của bạn"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {error && <Alert message="Lỗi cập nhật" description={error} type="error" showIcon />}

        {/* Basic account status info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-gray-400 block">Email đăng ký:</span>
            <span className="font-semibold text-gray-800 text-sm">{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Vai trò:</span>
            <span className="inline-block font-bold px-2 py-0.5 rounded bg-p-s100 text-p-s800">
              {user?.role === 'BENEFICIARY' ? 'Người thụ hưởng' : 'Thành viên ReGive'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Ngày tham gia:</span>
            <span className="font-semibold text-gray-700">{formatDate(user?.createdAt)}</span>
          </div>
        </div>

        <Form
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{
            fullName: user?.fullName,
            phone: user?.phone,
            address: user?.address,
            householdSize: user?.beneficiaryInfo?.householdSize,
            note: user?.beneficiaryInfo?.note,
          }}
          requiredMark="optional"
          className="space-y-4"
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input prefix={<User className="w-4 h-4 text-gray-400 mr-1" />} size="large" className="!rounded-xl" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Số điện thoại" name="phone">
              <Input prefix={<Phone className="w-4 h-4 text-gray-400 mr-1" />} size="large" className="!rounded-xl" />
            </Form.Item>

            <Form.Item label="Địa chỉ liên hệ" name="address">
              <Input prefix={<MapPin className="w-4 h-4 text-gray-400 mr-1" />} size="large" className="!rounded-xl" />
            </Form.Item>
          </div>

          {/* Beneficiary specific fields */}
          {user?.role === 'BENEFICIARY' && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-p-s600" />
                <span>Thông tin hoàn cảnh người thụ hưởng</span>
              </h4>

              <Form.Item label="Số nhân khẩu trong hộ gia đình" name="householdSize">
                <InputNumber min={1} max={50} size="large" className="w-full !rounded-xl" />
              </Form.Item>

              <Form.Item label="Ghi chú hoàn cảnh / Nhu cầu hỗ trợ chính" name="note">
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả hoàn cảnh khó khăn của gia đình hoặc đối tượng thụ hưởng..."
                  className="!rounded-xl"
                />
              </Form.Item>
            </div>
          )}

          <div className="pt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<Save className="w-4 h-4" />}
              size="large"
              className="px-8 rounded-xl bg-p-s600 hover:bg-p-s700 text-white font-bold text-sm shadow-md shadow-p-s600/20"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </div>
    </DashboardLayout>
  );
}
