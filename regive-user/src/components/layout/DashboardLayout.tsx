'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthGuard } from '@/components/shared/AuthGuard';
import {
  LayoutDashboard,
  Gift,
  HandHeart,
  Package,
  CreditCard,
  LifeBuoy,
  User as UserIcon,
  Bell,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = [
    {
      label: 'Tổng quan cá nhân',
      href: '/me/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Lịch sử quyên góp',
      href: '/me/donations',
      icon: <Gift className="w-4 h-4" />,
    },
    {
      label: 'Đăng ký tình nguyện',
      href: '/me/volunteers',
      icon: <HandHeart className="w-4 h-4" />,
    },
    {
      label: 'Đơn hàng Marketplace',
      href: '/me/orders',
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: 'Lịch sử thanh toán',
      href: '/me/payments',
      icon: <CreditCard className="w-4 h-4" />,
    },
    ...(user?.role === 'BENEFICIARY'
      ? [
          {
            label: 'Yêu cầu hỗ trợ của tôi',
            href: '/me/support-requests',
            icon: <LifeBuoy className="w-4 h-4 text-emerald-600" />,
          },
        ]
      : []),
    {
      label: 'Thông báo',
      href: '/notifications',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      label: 'Cài đặt tài khoản',
      href: '/profile',
      icon: <UserIcon className="w-4 h-4" />,
    },
  ];

  return (
    <AuthGuard>
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Bar */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6 sticky top-24">
                {/* User mini summary */}
                <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {user?.fullName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {user?.role === 'BENEFICIARY' ? 'Người thụ hưởng' : 'Thành viên'}
                    </span>
                  </div>
                </div>

                {/* Navigation links */}
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};
