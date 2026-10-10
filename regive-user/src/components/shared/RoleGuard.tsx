'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@/types';
import { Result, Button } from 'antd';
import Link from 'next/link';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallbackTitle = 'Không có quyền truy cập',
  fallbackMessage = 'Tính năng này chỉ dành cho người dùng có vai trò được chỉ định.',
}) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <Result
          status="403"
          title={fallbackTitle}
          subTitle={fallbackMessage}
          extra={
            <Link href="/">
              <Button type="primary" className="bg-p-s600">
                Về trang chủ
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};
