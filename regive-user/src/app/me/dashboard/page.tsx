'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Progress } from 'antd';
import {
  Gift,
  HandHeart,
  Package,
  CreditCard,
  LifeBuoy,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
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

function getImpactBadge(totalMoney: number, volCount: number) {
  if (totalMoney >= 5000000 || volCount >= 5) {
    return { title: 'Đại Sứ Thiện Nguyện', level: 'Bạch Kim', color: 'from-amber-500 to-yellow-600', icon: '', nextGoal: 'Đạt danh hiệu cao nhất' };
  }
  if (totalMoney >= 1000000 || volCount >= 2) {
    return { title: 'Trái Tim Vàng', level: 'Vàng', color: 'from-emerald-600 to-teal-700', icon: '', nextGoal: 'Ủng hộ thêm để đạt hạng Bạch Kim' };
  }
  return { title: 'Hạt Giống Hy Vọng', level: 'Đồng Hành', color: 'from-teal-600 to-sky-700', icon: '', nextGoal: 'Tích lũy từ 1.000.000đ để đạt Trái Tim Vàng' };
}

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

  const productDonations = donations.filter((d) => d.type === 'product');
  const badgeInfo = getImpactBadge(totalDonatedMoney, volunteers.length);

  return (
    <DashboardLayout
      title={`Xin chào, ${user?.fullName}!`}
      subtitle="Bảng điều khiển cá nhân & tổng hợp hành trình thiện nguyện của bạn trên ReGive"
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
                  {donations.length} lượt đóng góp ({productDonations.length} hiện vật)
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
                <span className="text-[11px] text-sky-600 font-semibold">
                  Chiến dịch đã đăng ký
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-gray-400 font-medium block">Đơn hàng Marketplace</span>
                <span className="text-xl font-black text-gray-900 block">{orders.length}</span>
                <span className="text-[11px] text-teal-600 font-semibold">Vật phẩm trao tặng</span>
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
                  <span className="text-xs text-gray-400 font-medium block">Hạng thành viên</span>
                  <span className="text-base font-black text-gray-900 block truncate">
                    {badgeInfo.title}
                  </span>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    Cấp độ {badgeInfo.level}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Impact Passport Card */}
        <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl bg-gradient-to-r ${badgeInfo.color} relative overflow-hidden`}>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>Hộ Chiếu Thiện Nguyện ReGive</span>
              </div>
              <h3 className="text-2xl font-black">
                {badgeInfo.icon} {badgeInfo.title} — {user?.fullName}
              </h3>
              <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed">
                Cảm ơn bạn đã đồng hành cùng cộng đồng ReGive. Mỗi đóng góp của bạn đã trực tiếp giúp đỡ các em nhỏ vùng cao và gia đình khó khăn.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[240px] space-y-2 text-xs">
              <div className="flex justify-between items-center text-white/90">
                <span>Cấp độ hiện tại:</span>
                <span className="font-bold text-amber-300">{badgeInfo.level}</span>
              </div>
              <div className="flex justify-between items-center text-white/90">
                <span>Điểm hoạt động:</span>
                <span className="font-bold text-white">{donations.length * 10 + volunteers.length * 20} điểm</span>
              </div>
              <p className="text-[11px] text-white/80 pt-1 border-t border-white/10">
                Mục tiêu: {badgeInfo.nextGoal}
              </p>
            </div>
          </div>
        </div>

        {/* Personal ESG & Green Footprint */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl"></span>
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">Dấu Chân Sinh Thái & Tác Động Xã Hội Cá Nhân</h4>
                <p className="text-xs text-gray-500">Lượng hóa giá trị bảo vệ môi trường và đóng góp cộng đồng từ hành trình của bạn</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-600 text-white self-start sm:self-auto">
              Chỉ số ESG Cá Nhân
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Vật phẩm đã tuần hoàn</span>
              <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">
                {productDonations.length} món
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Được cứu khỏi bãi rác</span>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Rác thải giảm thiểu</span>
              <span className="text-2xl font-black text-teal-800 font-mono mt-1 block">
                ~{(productDonations.length * 1.2).toFixed(1)} kg
              </span>
              <span className="text-[10px] text-teal-600 font-semibold block mt-1">Chuyển hướng tái sinh</span>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Giảm phát thải CO2</span>
              <span className="text-2xl font-black text-sky-800 font-mono mt-1 block">
                ~{(productDonations.length * 1.2 * 2.5).toFixed(1)} kg
              </span>
              <span className="text-[10px] text-sky-600 font-semibold block mt-1">Tiết kiệm năng lượng sản xuất</span>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-xs">
              <span className="text-xs text-gray-400 font-medium block">Bữa ăn dinh dưỡng tạo ra</span>
              <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                ~{Math.max(1, Math.floor(totalDonatedMoney / 30000))} bữa
              </span>
              <span className="text-[10px] text-amber-600 font-semibold block mt-1">Cho các em nhỏ vùng cao</span>
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Chung tay lan tỏa yêu thương</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Bạn có thể tiếp tục ủng hộ tiền mặt, trao tặng hiện vật còn tốt hoặc tham gia các sự kiện tình nguyện mới nhất.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/campaigns">
              <Button className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-0">
                Ủng hộ chiến dịch
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button className="h-10 rounded-xl border border-white/30 text-white font-semibold hover:border-white bg-transparent">
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
                Xem tất cả ({donations.length})
              </Link>
            </div>

            {donations.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Chưa có giao dịch quyên góp nào.</p>
            ) : (
              <div className="space-y-3">
                {donations.slice(0, 4).map((d) => (
                  <div
                    key={d._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {typeof d.campaign === 'object' && d.campaign?.title
                          ? d.campaign.title
                          : 'Chiến dịch thiện nguyện'}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        {d.type === 'money' ? formatVND(d.amount) : `Hiện vật: ${d.productInfo?.name || 'Vật phẩm'}`} • {formatDate(d.createdAt)}
                      </p>
                    </div>
                    <StatusBadge type="donation" status={d.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Volunteer Registrations */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <HandHeart className="w-4 h-4 text-sky-600" />
                <span>Hoạt động tình nguyện</span>
              </h3>
              <Link href="/me/volunteers" className="text-xs font-semibold text-sky-600 hover:underline">
                Xem tất cả ({volunteers.length})
              </Link>
            </div>

            {volunteers.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Bạn chưa đăng ký tình nguyện viên cho chiến dịch nào.</p>
            ) : (
              <div className="space-y-3">
                {volunteers.slice(0, 4).map((v) => (
                  <div
                    key={v._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-800">
                        {typeof v.campaign === 'object' && v.campaign?.title
                          ? v.campaign.title
                          : 'Chiến dịch thiện nguyện'}
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        Lịch: {v.schedule?.timeSlot || 'Cả ngày'} • {formatDate(v.createdAt)}
                      </p>
                    </div>
                    <StatusBadge type="volunteer" status={v.status} />
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
