'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Dropdown, Badge, Drawer, type MenuProps } from 'antd';
import {
  Heart,
  ShoppingBag,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Gift,
  HandHeart,
  Package,
  CreditCard,
  LifeBuoy,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types';

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      notificationService
        .listMine({ unread: true })
        .then((items) => setUnreadCount(items.length))
        .catch(() => {});
    }
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { label: 'Chiến dịch', href: '/campaigns' },
    { label: 'Cửa hàng thiện nguyện', href: '/marketplace' },
    { label: 'Về ReGive', href: '/about' },
    { label: 'Hỏi đáp', href: '/faq' },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="py-1 px-1">
          <p className="font-semibold text-gray-900">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            {user?.role === 'BENEFICIARY' ? 'Người thụ hưởng' : 'Thành viên'}
          </span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: <Link href="/me/dashboard">Tổng quan của tôi</Link>,
    },
    {
      key: 'donations',
      icon: <Gift className="w-4 h-4" />,
      label: <Link href="/me/donations">Quyên góp của tôi</Link>,
    },
    {
      key: 'volunteers',
      icon: <HandHeart className="w-4 h-4" />,
      label: <Link href="/me/volunteers">Đăng ký tình nguyện</Link>,
    },
    {
      key: 'orders',
      icon: <Package className="w-4 h-4" />,
      label: <Link href="/me/orders">Đơn hàng Marketplace</Link>,
    },
    {
      key: 'payments',
      icon: <CreditCard className="w-4 h-4" />,
      label: <Link href="/me/payments">Lịch sử thanh toán</Link>,
    },
    ...(user?.role === 'BENEFICIARY'
      ? [
          {
            key: 'support-requests',
            icon: <LifeBuoy className="w-4 h-4 text-emerald-600" />,
            label: <Link href="/me/support-requests">Yêu cầu hỗ trợ</Link>,
          },
        ]
      : []),
    {
      key: 'profile',
      icon: <UserIcon className="w-4 h-4" />,
      label: <Link href="/profile">Cài đặt tài khoản</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-500">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">
              Re<span className="text-emerald-600">Give</span>
            </span>
            <span className="hidden sm:block text-[10px] text-gray-400 font-medium -mt-1 leading-none">
              Nền tảng trao tặng & thiện nguyện
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 font-semibold'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user?.role === 'BENEFICIARY' && (
            <Link
              href="/support/new"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              + Gửi yêu cầu hỗ trợ
            </Link>
          )}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
              >
                <Badge count={unreadCount} size="small" offset={[2, -2]}>
                  <Bell className="w-5 h-5" />
                </Badge>
              </Link>

              {/* User Dropdown */}
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <button className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 hover:border-emerald-500 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs font-medium text-gray-700 max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                </button>
              </Dropdown>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button type="text" className="font-semibold text-gray-600 hover:text-emerald-600">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  type="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm shadow-emerald-600/30"
                >
                  Tham gia ngay
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu điều hướng"
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium py-2 border-b border-gray-100 text-gray-800 hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}

          {user?.role === 'BENEFICIARY' && (
            <Link
              href="/support/new"
              onClick={() => setMobileOpen(false)}
              className="text-base font-semibold py-2 text-emerald-700 hover:text-emerald-800"
            >
              + Gửi yêu cầu hỗ trợ
            </Link>
          )}

          <div className="pt-4 mt-auto">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/me/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm font-semibold text-gray-800"
                >
                  Trang cá nhân của tôi
                </Link>
                <Button danger onClick={handleLogout} className="w-full">
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Đăng nhập</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button type="primary" className="w-full bg-emerald-600">
                    Đăng ký tài khoản
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};
