'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading, initialized, loadUser } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      loadUser();
    }
  }, [initialized, loadUser]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [initialized, loading, user, router]);

  if (!initialized || loading || !user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <Spin size="large" />
        <p className="mt-4 text-sm text-gray-500">Đang kiểm tra thông tin đăng nhập...</p>
      </div>
    );
  }

  return <>{children}</>;
};
