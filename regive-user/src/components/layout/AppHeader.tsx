'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Drawer } from 'antd';
import {
  Heart,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationService } from '@/services/notificationService';

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      notificationService
        .listMine({ unread: true })
        .then((items) => setUnreadCount(items.length))
        .catch(() => { });
    }
  }, [user, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { label: 'Chiến dịch', href: '/campaigns' },
    { label: 'Cửa hàng', href: '/marketplace' },
    { label: 'Minh bạch', href: '/transparency' },
    { label: 'Về ReGive', href: '/about' },
    { label: 'Hỏi đáp', href: '/faq' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl ${scrolled
          ? 'bg-white/95 border-b-2 border-p-s100 shadow-sm'
          : 'bg-white/90 border-b-2 border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between gap-4">
        {/* ── Brand Logo ── */}
        <Link href="/" className="flex items-center gap-3 group no-underline shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-p-s500 to-p-s400 flex items-center justify-center shadow-md shadow-p-s500/25 group-hover:scale-110 transition-transform duration-200">
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <span className="font-bold text-xl sm:text-2xl text-n-s900 leading-tight tracking-tight block">
              Re<span className="text-p-s600">Give</span>
            </span>
            <span className="block text-[10px] text-n-s400 font-semibold tracking-wider -mt-0.5">
              Trao tặng · Thiện nguyện
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Điều hướng chính"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm no-underline transition-all duration-200 ${isActive
                    ? 'font-extrabold text-p-s700 bg-p-s100 border border-p-s300/60 shadow-sm'
                    : 'font-semibold text-n-s700 border border-transparent hover:bg-p-s50 hover:text-p-s700'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user?.role === 'BENEFICIARY' && (
            <Link
              href="/support/new"
              className="ml-1 px-4 py-2 rounded-full bg-sec-s50 text-sec-s700 text-xs font-bold border border-sec-s300/40 no-underline shadow-sm hover:bg-sec-s100 transition-colors"
            >
              🆘 Gửi hỗ trợ
            </Link>
          )}
        </nav>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/notifications"
                className="relative p-2.5 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-n-s200 text-sec-s600 no-underline hover:border-sec-s400 hover:text-sec-s500 transition-colors"
                aria-label={`Thông báo — ${unreadCount} chưa đọc`}
              >
                <Badge count={unreadCount} size="small" offset={[3, -3]}>
                  <Bell className="w-5 h-5" />
                </Badge>
              </Link>

              {/* User Avatar Dropdown */}
              <div className="relative group/user">
                <button
                  className="flex items-center gap-2 py-1.5 pr-2.5 pl-1.5 rounded-full border-2 border-n-s200 bg-white shadow-sm cursor-pointer hover:border-p-s400 transition-colors"
                  aria-haspopup="true"
                  aria-label={`Tài khoản của ${user.fullName}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-p-s100 to-p-s200 text-p-s700 font-black text-sm flex items-center justify-center border border-p-s300/60">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs font-bold text-n-s800 max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="hidden group-hover/user:block absolute right-0 top-full mt-2 w-56 z-50 bg-white rounded-2xl shadow-xl border border-n-s200 py-2">
                  <div className="px-4 py-2.5 border-b border-n-s200">
                    <p className="font-bold text-sm text-n-s900 m-0 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-n-s400 my-0.5 truncate">{user.email}</p>
                    <span className="clay-badge clay-badge-green text-[10px] mt-1 inline-flex">
                      {user.role === 'BENEFICIARY' ? 'Người thụ hưởng' : 'Thành viên'}
                    </span>
                  </div>
                  {[
                    { href: '/me/dashboard', label: 'Tổng quan của tôi' },
                    { href: '/me/donations', label: 'Quyên góp của tôi' },
                    { href: '/me/volunteers', label: 'Đăng ký tình nguyện' },
                    { href: '/me/orders', label: 'Đơn hàng Marketplace' },
                    { href: '/me/payments', label: 'Lịch sử thanh toán' },
                    ...(user.role === 'BENEFICIARY' ? [{ href: '/me/support-requests', label: 'Yêu cầu hỗ trợ' }] : []),
                    { href: '/profile', label: 'Cài đặt tài khoản' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-semibold text-n-s700 no-underline hover:bg-p-s50 hover:text-p-s700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-n-s200 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs sm:text-sm font-bold text-red-500 bg-transparent border-0 w-full cursor-pointer text-left hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full text-sm font-bold text-n-s800 no-underline border-2 border-n-s200 bg-white shadow-sm hover:border-p-s400 hover:text-p-s700 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-bold text-white bg-p-s500 hover:bg-p-s600 no-underline shadow-md shadow-p-s500/30 transition-colors"
              >
                Tham gia ngay
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2.5 rounded-xl bg-white border border-n-s200 shadow-sm text-n-s900 cursor-pointer flex items-center justify-center hover:bg-n-s50"
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <Drawer
        title={
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-p-s500 to-p-s400 flex items-center justify-center shadow-md">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="font-bold text-xl text-n-s900">
              Re<span className="text-p-s600">Give</span>
            </span>
          </Link>
        }
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        closeIcon={<X className="w-5 h-5" />}
        size={300}
      >
        <div className="flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm no-underline transition-colors ${isActive
                    ? 'font-extrabold text-p-s700 bg-p-s100 border border-p-s300/40'
                    : 'font-semibold text-n-s700 border border-transparent hover:bg-p-s50'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user?.role === 'BENEFICIARY' && (
            <Link
              href="/support/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-sec-s700 bg-sec-s50 no-underline border border-sec-s300/40"
            >
              Gửi yêu cầu hỗ trợ
            </Link>
          )}

          <div className="mt-4 pt-4 border-t-2 border-n-s200">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/me/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-bold text-n-s900 bg-white no-underline shadow-sm border border-n-s200"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-p-s100 to-p-s200 text-p-s700 font-black text-xs flex items-center justify-center">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  {user.fullName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="py-3 px-4 rounded-2xl bg-red-50 text-red-500 font-bold text-sm border border-red-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="clay-btn-outline w-full justify-center no-underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="clay-btn-primary w-full justify-center no-underline"
                >
                  Tham gia ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};
