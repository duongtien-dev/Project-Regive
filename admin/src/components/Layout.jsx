import {
  Bell,
  HandHelping,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  Warehouse,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { notificationApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { classNames } from '../lib/format';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/campaigns', icon: Megaphone, label: 'Chiến dịch' },
  { to: '/donations', icon: HeartHandshake, label: 'Quyên góp' },
  { to: '/volunteers', icon: Users, label: 'Tình nguyện' },
  { to: '/support', icon: HandHelping, label: 'Hỗ trợ' },
  { to: '/products', icon: Package, label: 'Sản phẩm' },
  { to: '/inventory', icon: Warehouse, label: 'Kho' },
  { to: '/orders', icon: ShoppingBag, label: 'Đơn hàng' },
  { to: '/payments', icon: Wallet, label: 'Thanh toán' },
  { to: '/ai', icon: Sparkles, label: 'AI đánh giá' },
  { to: '/users', icon: Shield, label: 'Người dùng', adminOnly: true },
  { to: '/notifications', icon: Bell, label: 'Thông báo' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let timer;
    async function load() {
      try {
        const res = await notificationApi.list({ unread: 'true' });
        setUnread(res.data.notifications?.length || 0);
      } catch {
        setUnread(0);
      }
    }
    load();
    timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const items = NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-svh bg-sand">
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-white/5 bg-forest text-sand transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="grain absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col px-4 py-5">
          <div className="mb-8 flex items-center justify-between px-2">
            <div>
              <p className="font-display text-2xl text-lime">ReGive</p>
              <p className="text-xs tracking-[0.2em] text-sand/55 uppercase">Ops console</p>
            </div>
            <button className="rounded-full p-2 lg:hidden" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition',
                    isActive ? 'bg-lime text-ink' : 'text-sand/80 hover:bg-white/8 hover:text-white'
                  )
                }
              >
                <item.icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.to === '/notifications' && unread > 0 ? (
                  <span className="rounded-full bg-clay px-2 py-0.5 text-[11px] text-white">{unread}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 rounded-2xl bg-white/8 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/20 text-lime">
                <UserRound size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
                <p className="truncate text-xs text-sand/55">{user?.role}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 rounded-full bg-white/10 px-3 py-2 text-xs text-sand hover:bg-white/15"
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
              >
                Hồ sơ
              </button>
              <button
                className="rounded-full bg-white/10 px-3 py-2 text-sand hover:bg-white/15"
                onClick={logout}
                title="Đăng xuất"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-forest/8 bg-sand/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button className="rounded-full p-2" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <p className="font-display text-lg">ReGive</p>
          <span className="w-9" />
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
