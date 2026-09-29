'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge, Drawer, type MenuProps } from 'antd';
import {
  Heart,
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
  X,
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
  const [scrolled, setScrolled] = useState(false);

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
    { label: 'Chiến dịch', href: '/campaigns', emoji: '🌱' },
    { label: 'Cửa hàng', href: '/marketplace', emoji: '🛍️' },
    { label: 'Minh bạch', href: '/transparency', emoji: '📊' },
    { label: 'Về ReGive', href: '/about', emoji: '💚' },
    { label: 'Hỏi đáp', href: '/faq', emoji: '❓' },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="py-1 px-1">
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--clay-navy)', fontSize: 15 }}>
            {user?.fullName}
          </p>
          <p style={{ fontSize: 12, color: 'var(--clay-navy-500)' }}>{user?.email}</p>
          <span
            className="clay-badge clay-badge-green"
            style={{ marginTop: 6, display: 'inline-flex' }}
          >
            {user?.role === 'BENEFICIARY' ? '🤲 Người thụ hưởng' : '💚 Thành viên'}
          </span>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-4 h-4" style={{ color: 'var(--clay-green-deep)' }} />,
      label: <Link href="/me/dashboard">Tổng quan của tôi</Link>,
    },
    {
      key: 'donations',
      icon: <Gift className="w-4 h-4" style={{ color: 'var(--clay-coral)' }} />,
      label: <Link href="/me/donations">Quyên góp của tôi</Link>,
    },
    {
      key: 'volunteers',
      icon: <HandHeart className="w-4 h-4" style={{ color: 'var(--clay-mint)' }} />,
      label: <Link href="/me/volunteers">Đăng ký tình nguyện</Link>,
    },
    {
      key: 'orders',
      icon: <Package className="w-4 h-4" style={{ color: 'var(--clay-sky)' }} />,
      label: <Link href="/me/orders">Đơn hàng Marketplace</Link>,
    },
    {
      key: 'payments',
      icon: <CreditCard className="w-4 h-4" style={{ color: 'var(--clay-navy-500)' }} />,
      label: <Link href="/me/payments">Lịch sử thanh toán</Link>,
    },
    ...(user?.role === 'BENEFICIARY'
      ? [
          {
            key: 'support-requests',
            icon: <LifeBuoy className="w-4 h-4" style={{ color: 'var(--clay-coral)' }} />,
            label: <Link href="/me/support-requests">Yêu cầu hỗ trợ</Link>,
          },
        ]
      : []),
    {
      key: 'profile',
      icon: <UserIcon className="w-4 h-4" style={{ color: 'var(--clay-navy-500)' }} />,
      label: <Link href="/profile">Cài đặt tài khoản</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4" style={{ color: '#EF4444' }} />,
      label: <span style={{ color: '#EF4444', fontWeight: 700 }}>Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'rgba(255,248,240,.95)' : 'rgba(255,248,240,.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled
          ? '2px solid rgba(34,197,94,.18)'
          : '2px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-clay-sm)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* ── Brand Logo ── */}
        <Link href="/" className="flex items-center gap-3 group" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--clay-green) 0%, var(--clay-mint) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-green)',
              transition: 'transform 0.25s var(--ease-spring)',
            }}
            className="group-hover:scale-110"
          >
            <Heart className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--clay-navy)',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              Re<span style={{ color: 'var(--clay-green-deep)' }}>Give</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: 10,
                color: 'var(--clay-navy-300)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginTop: -1,
              }}
            >
              Trao tặng · Thiện nguyện
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav
          className="hidden md:flex items-center"
          style={{ gap: 4 }}
          aria-label="Điều hướng chính"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 14,
                  fontWeight: isActive ? 800 : 600,
                  fontFamily: 'var(--font-body)',
                  color: isActive ? 'var(--clay-green-deep)' : 'var(--clay-navy-700)',
                  background: isActive ? 'var(--clay-green-soft)' : 'transparent',
                  border: isActive ? '1.5px solid rgba(34,197,94,.25)' : '1.5px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? 'var(--shadow-clay-sm)' : 'none',
                }}
                className="hover:bg-green-50 hover:text-green-700"
              >
                <span style={{ fontSize: 13 }}>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}

          {user?.role === 'BENEFICIARY' && (
            <Link
              href="/support/new"
              style={{
                marginLeft: 4,
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--clay-coral-soft)',
                color: '#C2410C',
                fontSize: 13,
                fontWeight: 700,
                border: '1.5px solid rgba(251,146,60,.30)',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-clay-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              🆘 Gửi hỗ trợ
            </Link>
          )}
        </nav>

        {/* ── Right controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {user ? (
            <>
              {/* Notification Bell */}
              <Link
                href="/notifications"
                style={{
                  position: 'relative',
                  padding: 10,
                  borderRadius: 16,
                  background: 'var(--clay-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-clay-sm)',
                  border: '1.5px solid var(--clay-border)',
                  color: 'var(--clay-navy-500)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                className="hover:border-green-400 hover:text-green-600"
                aria-label={`Thông báo — ${unreadCount} chưa đọc`}
              >
                <Badge count={unreadCount} size="small" offset={[3, -3]}>
                  <Bell className="w-5 h-5" />
                </Badge>
              </Link>

              {/* User Avatar Dropdown */}
              <div className="relative group/user">
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 10px 6px 6px',
                    borderRadius: 20,
                    border: '2px solid var(--clay-border)',
                    background: 'var(--clay-surface)',
                    boxShadow: 'var(--shadow-clay-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  className="hover:border-green-400"
                  aria-haspopup="true"
                  aria-label={`Tài khoản của ${user.fullName}`}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--clay-green-soft), var(--clay-mint-soft))',
                      color: 'var(--clay-green-deep)',
                      fontWeight: 900,
                      fontSize: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      border: '2px solid rgba(34,197,94,.25)',
                    }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--clay-navy-700)',
                      maxWidth: 100,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {user.fullName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div
                  className="hidden group-hover/user:block absolute right-0 top-full mt-2 w-56 z-50"
                  style={{
                    background: 'var(--clay-surface)',
                    borderRadius: 'var(--radius-clay-md)',
                    boxShadow: 'var(--shadow-clay-lg)',
                    border: '1.5px solid var(--clay-border)',
                    padding: '8px 0',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--clay-border)' }}>
                    <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--clay-navy)', margin: 0 }}>
                      {user.fullName}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--clay-navy-300)', margin: '2px 0 6px' }}>{user.email}</p>
                    <span className="clay-badge clay-badge-green" style={{ fontSize: 11 }}>
                      {user.role === 'BENEFICIARY' ? '🤲 Người thụ hưởng' : '💚 Thành viên'}
                    </span>
                  </div>
                  {[
                    { href: '/me/dashboard', icon: '📊', label: 'Tổng quan của tôi' },
                    { href: '/me/donations', icon: '🎁', label: 'Quyên góp của tôi' },
                    { href: '/me/volunteers', icon: '🤝', label: 'Đăng ký tình nguyện' },
                    { href: '/me/orders', icon: '📦', label: 'Đơn hàng Marketplace' },
                    { href: '/me/payments', icon: '💳', label: 'Lịch sử thanh toán' },
                    ...(user.role === 'BENEFICIARY' ? [{ href: '/me/support-requests', icon: '🆘', label: 'Yêu cầu hỗ trợ' }] : []),
                    { href: '/profile', icon: '⚙️', label: 'Cài đặt tài khoản' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--clay-navy-700)',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      className="hover:bg-green-50"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--clay-border)', marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      className="hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center" style={{ gap: 8 }}>
              <Link
                href="/login"
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--clay-navy-700)',
                  textDecoration: 'none',
                  border: '2px solid var(--clay-border)',
                  background: 'var(--clay-surface)',
                  boxShadow: 'var(--shadow-clay-sm)',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)',
                }}
                className="hover:border-green-400 hover:text-green-700"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="clay-btn-primary"
                style={{ padding: '9px 22px', fontSize: 14 }}
              >
                🌱 Tham gia ngay
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            style={{
              padding: 10,
              borderRadius: 14,
              background: 'var(--clay-surface)',
              border: '2px solid var(--clay-border)',
              boxShadow: 'var(--shadow-clay-sm)',
              color: 'var(--clay-navy)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Mở menu điều hướng"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <Drawer
        title={
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--clay-green), var(--clay-mint))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-green)',
              }}
            >
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--clay-navy)' }}>
              Re<span style={{ color: 'var(--clay-green-deep)' }}>Give</span>
            </span>
          </Link>
        }
        placement="right"
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        closeIcon={<X className="w-5 h-5" />}
        width={300}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-clay-md)',
                  fontSize: 15,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? 'var(--clay-green-deep)' : 'var(--clay-navy-700)',
                  background: isActive ? 'var(--clay-green-soft)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)',
                  border: isActive ? '1.5px solid rgba(34,197,94,.2)' : '1.5px solid transparent',
                }}
              >
                <span style={{ fontSize: 18 }}>{link.emoji}</span>
                {link.label}
              </Link>
            );
          })}

          {user?.role === 'BENEFICIARY' && (
            <Link
              href="/support/new"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 'var(--radius-clay-md)',
                fontSize: 15,
                fontWeight: 700,
                color: '#C2410C',
                background: 'var(--clay-coral-soft)',
                textDecoration: 'none',
                border: '1.5px solid rgba(251,146,60,.25)',
                fontFamily: 'var(--font-body)',
              }}
            >
              🆘 Gửi yêu cầu hỗ trợ
            </Link>
          )}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid var(--clay-border)' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                  href="/me/dashboard"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-clay-md)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--clay-navy)',
                    background: 'var(--clay-surface)',
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-clay-sm)',
                    border: '1.5px solid var(--clay-border)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, var(--clay-green-soft), var(--clay-mint-soft))',
                      color: 'var(--clay-green-deep)',
                      fontWeight: 900,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  {user.fullName}
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-clay-md)',
                    background: '#FEF2F2',
                    color: '#EF4444',
                    fontWeight: 700,
                    fontSize: 14,
                    border: '1.5px solid rgba(239,68,68,.25)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="clay-btn-outline"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="clay-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  🌱 Tham gia ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};
