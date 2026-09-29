'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Alert } from 'antd';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Repeat,
  Package,
  TrendingUp,
  Search,
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { marketplaceService } from '@/services/marketplaceService';
import { Campaign, Product } from '@/types';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { ProductCard } from '@/components/shared/ProductCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatVND } from '@/lib/format';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [cList, pList] = await Promise.all([
          campaignService.listPublic(),
          marketplaceService.listMarketplace(),
        ]);
        setCampaigns(cList);
        setProducts(pList);
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu trang chủ');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute live aggregates from active campaigns
  const totalRaised = campaigns.reduce((acc, c) => acc + (c.raisedAmount || 0), 0);
  const totalTarget = campaigns.reduce((acc, c) => acc + (c.targetAmount || 0), 0);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-slate-50 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nền tảng thiện nguyện & trao tặng tuần hoàn thế hệ mới</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
              Trao Đi Yêu Thương, <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                Lan Tỏa Giá Trị Tuần Hoàn
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed font-normal">
              ReGive biến từng đóng góp tiền mặt, vật phẩm cũ và thời gian tình nguyện
              thành những nguồn lực thiết thực nhất để hỗ trợ những mảnh đời khó khăn.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/campaigns">
                <Button
                  type="primary"
                  size="large"
                  icon={<Heart className="w-4 h-4 fill-white" />}
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all"
                >
                  Khám phá chiến dịch
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="large"
                  icon={<Repeat className="w-4 h-4" />}
                  className="w-full sm:w-auto h-12 px-8 rounded-xl border border-gray-300 hover:border-emerald-600 hover:text-emerald-600 font-semibold text-base bg-white shadow-xs"
                >
                  Cửa hàng trao tặng
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-12 pt-8 border-t border-gray-200/70 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Minh bạch 100%</p>
                  <p className="text-[11px] text-gray-500">Sao kê tự động</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Tuần hoàn đồ dùng</p>
                  <p className="text-[11px] text-gray-500">Giảm rác thải</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Tình nguyện viên</p>
                  <p className="text-[11px] text-gray-500">Kết nối trực tiếp</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Hỗ trợ đúng người</p>
                  <p className="text-[11px] text-gray-500">Xác thực thụ hưởng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-600/50">
            <div className="pt-4 md:pt-0">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white">
                {campaigns.length}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Chiến dịch đang gây quỹ
              </span>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-300 truncate">
                {formatVND(totalRaised)}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Tổng số tiền đã gây quỹ
              </span>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <span className="block text-3xl sm:text-4xl font-extrabold text-white">
                {products.length}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Vật phẩm tuần hoàn
              </span>
            </div>
            <div className="pt-4 md:pt-0 md:pl-6">
              <span className="block text-3xl sm:text-4xl font-extrabold text-teal-300">
                100%
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Theo dõi tiến độ minh bạch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Error notification if any */}
      {error && (
        <div className="max-w-7xl mx-auto px-4">
          <Alert message="Lỗi tải dữ liệu" description={error} type="warning" showIcon />
        </div>
      )}

      {/* Featured Campaigns Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Chung tay vì cộng đồng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Chiến Dịch Nổi Bật
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Xem tất cả chiến dịch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="Chưa có chiến dịch hoạt động"
            description="Hiện tại các chiến dịch đang trong quá trình chuẩn bị. Hãy quay lại sau!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {/* Marketplace Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/70 border border-slate-200/80 rounded-3xl p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Trao đổi & Gây quỹ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Cửa Hàng Trao Tặng ReGive
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Toàn bộ số tiền mua vật phẩm sẽ được chuyển thẳng vào quỹ hỗ trợ các chiến dịch thiện nguyện.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Xem chợ vật phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Cửa hàng đang được cập nhật"
              description="Các vật phẩm được quyên góp đang được kiểm tra và chuẩn bị lên kệ."
              actionText="Quyên góp vật phẩm"
              actionHref="/campaigns"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Circular Charity Model (3 steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Cách thức vận hành
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">
            Mô Hình Thiện Nguyện Tuần Hoàn
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Mọi sự đóng góp đều được tối ưu hóa để không lãng phí bất kỳ nguồn lực nào.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-lg mb-5">
              01
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quyên Góp Đa Dạng</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bạn có thể ủng hộ trực tiếp bằng tiền mặt hoặc trao tặng những đồ dùng còn tốt như sách vở, quần áo, thiết bị điện tử.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg mb-5">
              02
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Đánh Giá & Tuần Hoàn</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vật phẩm quyên góp được kiểm tra phân loại cẩn thận, chuyển giao trực tiếp cho người cần hoặc bán gây quỹ minh bạch trên sàn.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 font-bold flex items-center justify-center text-lg mb-5">
              03
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hỗ Trợ Tận Tay</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Người thụ hưởng nhận được nguồn lực đúng thời điểm và có thể xác nhận trực tiếp trên hệ thống, hoàn tất chu trình nhân ái.
            </p>
          </div>
        </div>
      </section>

      {/* Volunteer CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-8 sm:p-14 text-white">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Đồng hành cùng ReGive
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 leading-tight">
              Trở Thành Tình Nguyện Viên ReGive Ngay Hôm Nay
            </h2>
            <p className="mt-4 text-emerald-100 text-sm sm:text-base leading-relaxed">
              Bạn có kỹ năng, thời gian hoặc trái tim nhiệt huyết? Hãy cùng chúng tôi tham gia phân loại vật phẩm,
              tổ chức sự kiện và mang niềm vui đến cho các em nhỏ và gia đình cần giúp đỡ.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/campaigns">
                <Button
                  type="primary"
                  size="large"
                  className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                >
                  Đăng ký tham gia chiến dịch
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="large"
                  className="h-11 px-6 rounded-xl border-white/30 text-white hover:border-white font-semibold text-sm bg-transparent"
                >
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
