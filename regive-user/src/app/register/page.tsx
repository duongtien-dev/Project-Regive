'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, InputNumber, Button, Radio, Alert, message } from 'antd';
import { Heart, Lock, Mail, User, Phone, MapPin, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [role, setRole] = useState<Role>('USER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      setError(null);

      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        address: values.address,
        role,
      });

      message.success('Đăng ký tài khoản thành công!');
      router.push('/me/dashboard');
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-p-s600 to-sec-s500 flex items-center justify-center text-white shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">
              Re<span className="text-p-s600">Give</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-gray-900">Tạo Tài Khoản Mới</h2>
          <p className="mt-1 text-xs text-gray-500">
            Chọn vai trò phù hợp và cùng xây dựng cộng đồng sẻ chia
          </p>
        </div>

        {error && <Alert message="Lỗi đăng ký" description={error} type="error" showIcon />}

        {/* Role Selector Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Tôi tham gia với vai trò:
          </label>
          <Radio.Group
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <Radio.Button
              value="USER"
              className="!h-auto !py-3 !px-4 !rounded-xl !border-gray-200 text-center"
            >
              <span className="block font-bold text-gray-900 text-sm">Thành viên</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Ủng hộ, tình nguyện, mua sắm
              </span>
            </Radio.Button>

            <Radio.Button
              value="BENEFICIARY"
              className="!h-auto !py-3 !px-4 !rounded-xl !border-gray-200 text-center"
            >
              <span className="block font-bold text-gray-900 text-sm">Người thụ hưởng</span>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Cần hỗ trợ, nhận trợ giúp
              </span>
            </Radio.Button>
          </Radio.Group>
        </div>

        <Form layout="vertical" onFinish={handleSubmit} requiredMark="optional" className="space-y-4">
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input
              prefix={<User className="w-4 h-4 text-gray-400 mr-1" />}
              placeholder="Nguyễn Văn A"
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<Mail className="w-4 h-4 text-gray-400 mr-1" />}
              placeholder="example@regive.vn"
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password
              prefix={<Lock className="w-4 h-4 text-gray-400 mr-1" />}
              placeholder="Tối thiểu 6 ký tự"
              size="large"
              className="!rounded-xl"
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Số điện thoại" name="phone">
              <Input
                prefix={<Phone className="w-4 h-4 text-gray-400 mr-1" />}
                placeholder="09xxxxxxxx"
                size="large"
                className="!rounded-xl"
              />
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address">
              <Input
                prefix={<MapPin className="w-4 h-4 text-gray-400 mr-1" />}
                placeholder="Tỉnh/Thành phố..."
                size="large"
                className="!rounded-xl"
              />
            </Form.Item>
          </div>

          <div className="pt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
              className="w-full h-12 rounded-xl bg-p-s600 hover:bg-p-s700 text-white font-bold text-sm shadow-md shadow-p-s600/20"
            >
              Đăng ký tài khoản
            </Button>
          </div>
        </Form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-p-s600 hover:text-p-s700">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
