'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import {
  Gift,
  HandHeart,
  Package,
  CreditCard,
  LifeBuoy,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { donationService } from '@/services/donationService';
import { volunteerService } from '@/services/volunteerService';
import { orderService } from '@/services/orderService';
import { supportService } from '@/services/supportService';
import { Donation, VolunteerRegistration, Order, SupportRequest } from '@/types';
import { formatVND, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supports, setSupports] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [dList, vList, oList] = await Promise.all([
          donationService.getMyDonations().catch(() => []),
          volunteerService.getMyRegistrations().catch(() => []),
          orderService.getMyOrders().catch(() => []),
        ]);
        setDonations(dList);
        setVolunteers(vList);
        setOrders(oList);

        if (user?.role === 'BENEFICIARY') {
          const sList = await supportService.getMyRequests().catch(() => []);
          setSupports(sList);
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const totalDonatedMoney = donations
    .filter((d) => d.type === 'money' && d.status === 'completed')
    .reduce((acc, d) => acc + (d.amount || 0), 0);

  return (
    <DashboardLayout
      title={`Xin chào, ${user?.fullName}!`}
      subtitle="Tổng quan hoạt động và đóng góp của bạn trên ReGive"
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Tổng tiền quyên góp</span>
                <span className="text-lg font-black text-gray-900 truncate block">
                  {formatVND(totalDonatedMoney)}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {donations.length} lượt quyên góp
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <HandHeart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Tình nguyện viên</span>
                <span className="text-xl font-black text-gray-900 block">
                  {volunteers.length}
                </span>
                <span className="text-[11px] text-gray-400">Chiến dịch tham gia</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Đơn hàng mua sắm</span>
                <span className="text-xl font-black text-gray-900 block">{orders.length}</span>
                <span className="text-[11px] text-gray-400">Vật phẩm gây quỹ</span>
              </div>
            </div>

            {user?.role === 'BENEFICIARY' ? (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Yêu cầu hỗ trợ</span>
                  <span className="text-xl font-black text-gray-900 block">{supports.length}</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">Hồ sơ thụ hưởng</span>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Tác động xã hội</span>
                  <span className="text-xl font-black text-gray-900 block">Tích cực</span>
                  <span className="text-[11px] text-amber-600 font-semibold">Thành viên thân thiết</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Shortcuts */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Chung tay lan tỏa yêu thương</h3>
            <p className="text-xs text-emerald-100 max-w-md">
              Bạn có thể tiếp tục quyên góp tiền mặt, ủng hộ hiện vật còn tốt hoặc tham gia tình nguyện tại các chiến dịch mới.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/campaigns">
              <Button className="h-10 rounded-xl bg-white text-emerald-800 font-bold border-0 hover:bg-emerald-50">
                Ủng hộ chiến dịch
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button className="h-10 rounded-xl border border-white/40 text-white font-semibold hover:border-white bg-transparent">
                Chợ vật phẩm
              </Button>
            </Link>
            {user?.role === 'BENEFICIARY' && (
              <Link href="/support/new">
                <Button className="h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold border-0">
                  + Tạo yêu cầu hỗ trợ
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Quyên góp gần đây</span>
              </h3>
              <Link href="/me/donations" className="text-xs font-semibold text-emerald-600 hover:underline">
                Xem tất cả
              </Link>
            </div>

            {donations.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Chưa có giao dịch quyên góp nào.</p>
            ) : (
              <div className="space-y-3">
                {donations.slice(0, 4).map((d) => (
                  <div
                    key={d._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {typeof d.campaign === 'object' && d.campaign?.title
                          ? d.campaign.title
                          : 'Chiến dịch thiện nguyện'}
                      </p>
                      <p className="text-gray-400 mt-0.5">
                        {d.type === 'money' ? formatVND(d.amount) : `Hiện vật: ${d.productInfo?.name || 'Vật phẩm'}`} • {formatDate(d.createdAt)}
                      </p>
                    </div>
                    <StatusBadge type="donation" status={d.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                <span>Đơn hàng Marketplace</span>
              </h3>
              <Link href="/me/orders" className="text-xs font-semibold text-teal-600 hover:underline">
                Xem tất cả
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 4).map((o) => (
                  <div
                    key={o._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 font-mono">
                        {o.orderCode}
                      </p>
                      <p className="text-gray-400 mt-0.5">
                        {formatVND(o.totalAmount)} • {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <StatusBadge type="order" status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
