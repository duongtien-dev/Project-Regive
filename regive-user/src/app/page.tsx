'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Alert, Slider } from 'antd';
import {
  Heart,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Repeat,
  Package,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  Gift,
  HandHeart,
  Layers,
} from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { marketplaceService } from '@/services/marketplaceService';
import { reportService } from '@/services/reportService';
import { Campaign, Product, PublicImpact } from '@/types';
import { CampaignCard } from '@/components/shared/CampaignCard';
import { ProductCard } from '@/components/shared/ProductCard';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatVND } from '@/lib/format';

const IMPACT_TIERS = [
  {
    amount: 50000,
    label: '50.000 đ',
    title: '2 Bữa cơm ấm',
    desc: 'Cung cấp 2 phần cơm nóng hổi đầy đủ dinh dưỡng cho người vô gia cư tại TP.HCM.',
    icon: '🍲',
  },
  {
    amount: 150000,
    label: '150.000 đ',
    title: 'Bộ dụng cụ học tập',
    desc: 'Trang bị trọn bộ tập vở, bút màu, thước kẻ cho 1 em nhỏ vùng biên giới.',
    icon: '✏️',
  },
  {
    amount: 350000,
    label: '350.000 đ',
    title: 'Áo ấm & Ủng đi mưa',
    desc: 'Bảo vệ các em học sinh tiểu học Hà Giang vượt qua mùa đông buốt giá dưới 5°C.',
    icon: '🧥',
  },
  {
    amount: 1000000,
    label: '1.000.000 đ',
    title: 'Học bổng vượt khó 1 tháng',
    desc: 'Hỗ trợ sinh hoạt phí và sách vở cho trẻ em mồ côi hoặc gia đình bị sạt lở bão lũ.',
    icon: '🎓',
  },
];

const CAUSE_CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: '🌟' },
  { id: 'children', label: 'Trẻ em & Áo ấm', icon: '👶' },
  { id: 'disaster_relief', label: 'Cứu trợ bão lũ', icon: '🌧️' },
  { id: 'poverty_alleviation', label: 'Bữa cơm yêu thương', icon: '🍱' },
  { id: 'education', label: 'Tủ sách & Tri thức', icon: '📚' },
  { id: 'environment', label: 'Nước sạch nông thôn', icon: '💧' },
  { id: 'healthcare', label: 'Y tế & Nụ cười', icon: '🏥' },
];

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [impactData, setImpactData] = useState<PublicImpact | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [calculatorTier, setCalculatorTier] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [cList, pList, impact] = await Promise.all([
          campaignService.listPublic(),
          marketplaceService.listMarketplace(),
          reportService.getPublicImpact().catch(() => null),
        ]);
        setCampaigns(cList);
        setProducts(pList);
        if (impact) setImpactData(impact);
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu trang chủ');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCampaigns =
    selectedCategory === 'all'
      ? campaigns
      : campaigns.filter((c) => c.category === selectedCategory);

  const currentImpactTier = IMPACT_TIERS[calculatorTier];
  const featuredCampaign = campaigns[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Top Live Ticker */}
      {impactData?.recentDonations && impactData.recentDonations.length > 0 && (
        <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-2 font-semibold shrink-0">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ghi nhận thời gian thực:</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap ml-4 flex-1">
              <div className="inline-flex gap-8 text-emerald-200">
                {impactData.recentDonations.map((d) => (
                  <span key={d._id} className="inline-flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-rose-400 inline" />
                    <strong>{d.donorName}</strong> vừa đóng góp{' '}
                    <span className="text-white font-bold">
                      {d.type === 'money' ? formatVND(d.amount) : 'hiện vật'}
                    </span>{' '}
                    cho <span className="underline">{d.campaignTitle || 'ReGive'}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-teal-50/40 to-slate-50 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nền tảng thiện nguyện & trao tặng tuần hoàn minh bạch hàng đầu</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15]">
              Trao Đi Yêu Thương, <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                Lan Tỏa Giá Trị Tuần Hoàn
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              ReGive biến từng đóng góp tiền mặt, vật phẩm cũ và thời gian tình nguyện thành những
              nguồn lực thiết thực nhất để trao tận tay người thụ hưởng một cách minh bạch và trực tiếp.
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
                  Cửa hàng trao tặng ({products.length} vật phẩm)
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-12 pt-8 border-t border-gray-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Minh bạch 100%</p>
                  <p className="text-[11px] text-gray-500">Sao kê tự động</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Tuần hoàn đồ dùng</p>
                  <p className="text-[11px] text-gray-500">Giảm rác thải nhựa</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Tình nguyện viên</p>
                  <p className="text-[11px] text-gray-500">Kết nối thực địa</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <Package className="w-5 h-5" />
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
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-600/50">
            <div className="pt-2 md:pt-0">
              <span className="block text-3xl sm:text-4xl font-black text-white">
                {impactData?.totalCampaigns || campaigns.length}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Chiến dịch thiện nguyện
              </span>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-300 truncate">
                {formatVND(impactData?.totalRaised || 385000000)}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Tổng nguồn lực quyên góp
              </span>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <span className="block text-3xl sm:text-4xl font-black text-white">
                {impactData?.totalDonations || 148}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Lượt đóng góp thành công
              </span>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <span className="block text-3xl sm:text-4xl font-black text-teal-300">
                {impactData?.totalVolunteers || 24}
              </span>
              <span className="text-xs sm:text-sm text-emerald-200 mt-1 block">
                Tình nguyện viên đã xác nhận
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

      {/* Impact Calculator Interactive Tool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 border border-emerald-100 rounded-3xl p-6 sm:p-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Công cụ tính toán sức mạnh cộng đồng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Mỗi Đóng Góp Của Bạn Tạo Ra Thay Đổi Gì?
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Kéo thanh trượt hoặc chọn mức đóng góp để xem giá trị thiết thực bạn mang đến cho cộng đồng.
            </p>

            {/* Slider / Selector */}
            <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm text-left">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                {IMPACT_TIERS.map((tier, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCalculatorTier(idx)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      calculatorTier === idx
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="px-2">
                <Slider
                  min={0}
                  max={3}
                  step={1}
                  value={calculatorTier}
                  onChange={(val) => setCalculatorTier(val)}
                  tooltip={{ formatter: (val) => IMPACT_TIERS[val ?? 0].label }}
                />
              </div>

              {/* Result card */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-5 p-5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                <div className="text-4xl bg-white p-3 rounded-2xl shadow-xs shrink-0">
                  {currentImpactTier.icon}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-lg font-black text-emerald-950">
                    {currentImpactTier.title} ({currentImpactTier.label})
                  </h4>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {currentImpactTier.desc}
                  </p>
                </div>
                {featuredCampaign && (
                  <Link href={`/campaigns/${featuredCampaign._id}/donate-money?amount=${currentImpactTier.amount}`}>
                    <Button
                      type="primary"
                      className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl h-11 px-5 shadow-xs"
                    >
                      Ủng hộ mức này ngay
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section with Category Filtering */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Chung tay vì cộng đồng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Chiến Dịch Thiện Nguyện Cần Chung Tay
            </h2>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Xem tất cả ({campaigns.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {CAUSE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            title="Chưa có chiến dịch trong danh mục này"
            description="Hãy thử chọn danh mục khác hoặc quay lại xem toàn bộ chiến dịch."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.slice(0, 6).map((c) => (
              <CampaignCard key={c._id} campaign={c} />
            ))}
          </div>
        )}
      </section>

      {/* Top Donors Leaderboard Section */}
      {impactData?.topDonors && impactData.topDonors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="max-w-2xl mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Bảng vàng vinh danh</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Những Trái Tim Vàng ReGive
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                Tri ân các nhà hảo tâm và mạnh thường quân đã đồng hành cùng ReGive trao tặng yêu thương.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {impactData.topDonors.map((donor, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-black mb-3">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{donor.name}</h4>
                  <p className="text-xs text-amber-300 font-extrabold mt-1">
                    {formatVND(donor.totalAmount)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {donor.count} lượt ủng hộ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Marketplace Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Trao đổi & Gây quỹ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                Cửa Hàng Trao Tặng ReGive
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                100% doanh thu từ mua bán vật phẩm tuần hoàn được chuyển thẳng vào quỹ cứu trợ chiến dịch.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>Xem chợ vật phẩm ({products.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : products.length === 0 ? (
            <EmptyState
              title="Cửa hàng đang được cập nhật"
              description="Các vật phẩm được quyên góp đang được kiểm định và chuẩn bị lên kệ."
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
            Mọi nguồn lực quyên góp đều được phân loại, kiểm định và tối ưu hóa đến tận tay người cần.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-lg mb-5">
              01
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Quyên Góp Tiền & Vật Phẩm</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bạn có thể ủng hộ trực tiếp bằng tiền mặt hoặc trao tặng những đồ dùng còn tốt như sách vở, quần áo ấm, thiết bị điện tử.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg mb-5">
              02
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Kiểm Định & Tuần Hoàn</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Đội ngũ kiểm định phân loại cẩn thận, chuyển giao trực tiếp cho người cần hoặc đăng bán minh bạch trên sàn gây quỹ.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 font-bold flex items-center justify-center text-lg mb-5">
              03
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Trao Tận Tay & Báo Cáo</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tình nguyện viên trực tiếp trao quà, người thụ hưởng nhận quà và hệ thống cập nhật nhật ký thực địa minh bạch cho cộng đồng.
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
