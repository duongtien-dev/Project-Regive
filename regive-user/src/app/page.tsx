'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Slider } from 'antd';
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
  Gift,
  HandHeart,
  Layers,
  TreePine,
  Smile,
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
    color: 'var(--clay-coral)',
    bg: 'var(--clay-coral-soft)',
  },
  {
    amount: 150000,
    label: '150.000 đ',
    title: 'Bộ dụng cụ học tập',
    desc: 'Trang bị trọn bộ tập vở, bút màu, thước kẻ cho 1 em nhỏ vùng biên giới.',
    color: 'var(--clay-sky)',
    bg: 'var(--clay-sky-soft)',
  },
  {
    amount: 350000,
    label: '350.000 đ',
    title: 'Áo ấm & Ủng đi mưa',
    desc: 'Bảo vệ các em học sinh tiểu học Hà Giang vượt qua mùa đông buốt giá dưới 5°C.',
    color: 'var(--clay-lavender)',
    bg: '#F5F3FF',
  },
  {
    amount: 1000000,
    label: '1.000.000 đ',
    title: 'Học bổng vượt khó 1 tháng',
    desc: 'Hỗ trợ sinh hoạt phí và sách vở cho trẻ em mồ côi hoặc gia đình bị sạt lở bão lũ.',
    color: 'var(--clay-yellow)',
    bg: 'var(--clay-yellow-soft)',
  },
];

const CAUSE_CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'children', label: 'Trẻ em' },
  { id: 'disaster_relief', label: 'Cứu trợ' },
  { id: 'poverty_alleviation', label: 'Bữa cơm' },
  { id: 'education', label: 'Tri thức' },
  { id: 'environment', label: 'Nước sạch' },
  { id: 'healthcare', label: 'Y tế' },
];

const FLOW_STEPS = [
  {
    num: '01',
    title: 'Quyên Góp Tiền & Vật Phẩm',
    desc: 'Bạn có thể ủng hộ trực tiếp bằng tiền mặt hoặc trao tặng những đồ dùng còn tốt như sách vở, quần áo ấm, thiết bị điện tử.',
    color: 'var(--clay-green)',
    bg: 'var(--clay-green-soft)',
  },
  {
    num: '02',
    title: 'Kiểm Định & Tuần Hoàn',
    desc: 'Đội ngũ kiểm định phân loại cẩn thận, chuyển giao trực tiếp cho người cần hoặc đăng bán minh bạch trên sàn gây quỹ.',
    color: 'var(--clay-coral)',
    bg: 'var(--clay-coral-soft)',
  },
  {
    num: '03',
    title: 'Trao Tận Tay & Báo Cáo',
    desc: 'Tình nguyện viên trực tiếp trao quà, người thụ hưởng nhận quà và hệ thống cập nhật nhật ký thực địa minh bạch.',
    color: 'var(--clay-sky)',
    bg: 'var(--clay-sky-soft)',
  },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Live Ticker ── */}
      {impactData?.recentDonations && impactData.recentDonations.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(90deg, var(--clay-green-deep) 0%, #065F46 100%)',
            color: '#A7F3D0',
            fontSize: 12,
            padding: '8px 0',
            overflow: 'hidden',
          }}
          role="marquee"
          aria-label="Hoạt động quyên góp mới nhất"
        >
          <div style={{ display: 'flex', alignItems: 'center', maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#A7F3D0',
                marginRight: 16,
                flexShrink: 0,
                borderRight: '1px solid rgba(167,243,208,.30)',
                paddingRight: 16,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#4ADE80',
                  display: 'inline-block',
                  animation: 'float-slow 2s ease-in-out infinite',
                }}
                aria-hidden="true"
              />
              Live
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="ticker-inner" style={{ gap: 48 }}>
                {[...impactData.recentDonations, ...impactData.recentDonations].map((d, idx) => (
                  <span
                    key={`${d._id}-${idx}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 48 }}
                  >
                    <Heart className="w-3 h-3" style={{ color: '#FB923C', fill: '#FB923C', flexShrink: 0 }} />
                    <strong style={{ color: '#fff' }}>{d.donorName}</strong>
                    <span> vừa đóng góp</span>
                    <span style={{ color: '#4ADE80', fontWeight: 900 }}>
                      {d.type === 'money' ? formatVND(d.amount) : 'hiện vật'}
                    </span>
                    <span>cho</span>
                    <span style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      {d.campaignTitle || 'ReGive'}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section
        style={{
          background: 'linear-gradient(160deg, #FFF8F0 0%, #F0FDF4 40%, #EFF6FF 100%)',
          padding: '72px 24px 96px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative floating blobs */}
        <div
          aria-hidden="true"
          className="float-slow"
          style={{
            position: 'absolute',
            top: -40,
            right: '5%',
            width: 320,
            height: 320,
            borderRadius: '62% 38% 50% 50% / 46% 46% 54% 54%',
            background: 'radial-gradient(circle, rgba(34,197,94,.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          className="float-med"
          style={{
            position: 'absolute',
            bottom: -60,
            left: '3%',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '30%',
            left: '15%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,146,60,.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            {/* Hero Badge */}
            <div
              className="clay-section-tag"
              style={{ marginBottom: 24, fontSize: 12 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nền tảng thiện nguyện & trao tặng tuần hoàn minh bạch hàng đầu
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(36px, 6vw, 64px)',
                fontWeight: 700,
                color: 'var(--clay-navy)',
                lineHeight: 1.18,
                margin: '0 0 20px',
                letterSpacing: '-0.02em',
              }}
            >
              Trao Đi Yêu Thương,{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, var(--clay-green) 0%, var(--clay-mint) 50%, var(--clay-sky) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Lan Tỏa Giá Trị Tuần Hoàn
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 18,
                color: 'var(--clay-navy-500)',
                lineHeight: 1.7,
                margin: '0 0 36px',
                fontWeight: 400,
              }}
            >
              ReGive biến từng đóng góp tiền mặt, vật phẩm cũ và thời gian tình nguyện thành
              những nguồn lực thiết thực nhất để trao tận tay người thụ hưởng một cách{' '}
              <strong style={{ color: 'var(--clay-green-deep)', fontWeight: 700 }}>minh bạch và trực tiếp</strong>.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                marginBottom: 56,
              }}
            >
              <Link href="/campaigns" className="clay-btn-primary" style={{ fontSize: 15, padding: '14px 32px', textDecoration: 'none' }}>
                <Heart className="w-4 h-4 fill-white" />
                Khám phá chiến dịch
              </Link>
              <Link href="/marketplace" className="clay-btn-outline" style={{ fontSize: 15, padding: '12px 30px', textDecoration: 'none' }}>
                <Repeat className="w-4 h-4" />
                Cửa hàng trao tặng ({products.length} vật phẩm)
              </Link>
            </div>

            {/* Trust Points */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 16,
                paddingTop: 32,
                borderTop: '2px dashed rgba(34,197,94,.25)',
              }}
            >
              {[
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Minh bạch 100%', sub: 'Sao kê tự động', color: 'var(--clay-green)', bg: 'var(--clay-green-soft)' },
                { icon: <Repeat className="w-5 h-5" />, title: 'Tuần hoàn đồ dùng', sub: 'Giảm rác thải nhựa', color: 'var(--clay-coral)', bg: 'var(--clay-coral-soft)' },
                { icon: <Users className="w-5 h-5" />, title: 'Tình nguyện viên', sub: 'Kết nối thực địa', color: 'var(--clay-sky)', bg: 'var(--clay-sky-soft)' },
                { icon: <Package className="w-5 h-5" />, title: 'Hỗ trợ đúng người', sub: 'Xác thực thụ hưởng', color: 'var(--clay-lavender)', bg: '#F5F3FF' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: item.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-clay-sm)',
                      border: '1.5px solid rgba(255,255,255,.8)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--clay-navy)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--clay-navy-300)', margin: 0, fontWeight: 500 }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Stats Banner ── */}
      <section style={{ padding: '0 24px', transform: 'translateY(-40px)', position: 'relative', zIndex: 5 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F3320 100%)',
              borderRadius: 'var(--radius-clay-xl)',
              padding: '40px 48px',
              boxShadow: 'var(--shadow-clay-xl)',
              border: '2px solid rgba(255,255,255,.06)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 32,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative glow */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            {[
              { value: impactData?.totalCampaigns || campaigns.length, label: 'Chiến dịch thiện nguyện', color: '#4ADE80' },
              { value: formatVND(impactData?.totalRaised || 385000000), label: 'Tổng nguồn lực quyên góp', color: '#FBBF24', isFormatted: true },
              { value: impactData?.totalDonations || 148, label: 'Lượt đóng góp thành công', color: '#60A5FA' },
              { value: impactData?.totalVolunteers || 24, label: 'Tình nguyện viên đã xác nhận', color: '#FB923C' },
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-heading)',
                    fontSize: stat.isFormatted ? 22 : 40,
                    fontWeight: 700,
                    color: stat.color,
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}
                >
                  {stat.value}
                </span>
                <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, lineHeight: 1.4, display: 'block' }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Error ── */}
      {error && (
        <div style={{ maxWidth: 1280, margin: '-20px auto 0', padding: '0 24px 16px' }}>
          <Alert message="Lỗi tải dữ liệu" description={error} type="warning" showIcon />
        </div>
      )}

      {/* ── Impact Calculator ── */}
      <section style={{ padding: '8px 24px 64px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--clay-green-soft) 0%, var(--clay-mint-soft) 50%, var(--clay-sky-soft) 100%)',
              borderRadius: 'var(--radius-clay-xl)',
              padding: '56px 48px',
              border: '2px solid rgba(34,197,94,.15)',
              boxShadow: 'var(--shadow-clay-md)',
            }}
          >
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
              <div className="clay-section-tag" style={{ marginBottom: 20 }}>
                <Zap className="w-3.5 h-3.5" />
                Công cụ tính toán sức mạnh cộng đồng
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 700,
                  color: 'var(--clay-navy)',
                  margin: '0 0 12px',
                }}
              >
                Mỗi Đóng Góp Của Bạn Tạo Ra Thay Đổi Gì?
              </h2>
              <p style={{ fontSize: 15, color: 'var(--clay-navy-500)', margin: '0 0 36px', lineHeight: 1.6 }}>
                Chọn mức đóng góp để xem giá trị thiết thực bạn mang đến cho cộng đồng.
              </p>

              <div
                style={{
                  background: 'var(--clay-surface)',
                  borderRadius: 'var(--radius-clay-lg)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-clay-md)',
                  border: '2px solid rgba(255,255,255,.9)',
                  textAlign: 'left',
                }}
              >
                {/* Tier Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {IMPACT_TIERS.map((tier, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCalculatorTier(idx)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: 14,
                        fontWeight: 800,
                        border: '2px solid',
                        borderColor: calculatorTier === idx ? 'var(--clay-green)' : 'var(--clay-border)',
                        background: calculatorTier === idx ? 'var(--clay-green)' : 'var(--clay-surface)',
                        color: calculatorTier === idx ? '#fff' : 'var(--clay-navy-700)',
                        cursor: 'pointer',
                        boxShadow: calculatorTier === idx ? 'var(--shadow-green)' : 'var(--shadow-clay-sm)',
                        transition: 'all 0.2s var(--ease-spring)',
                        fontFamily: 'var(--font-body)',
                        transform: calculatorTier === idx ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: '0 4px' }}>
                  <Slider
                    min={0}
                    max={3}
                    step={1}
                    value={calculatorTier}
                    onChange={(val) => setCalculatorTier(val)}
                    tooltip={{ formatter: (val) => IMPACT_TIERS[val ?? 0].label }}
                  />
                </div>

                {/* Result Card */}
                <div
                  style={{
                    marginTop: 24,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 20,
                    padding: '24px',
                    borderRadius: 'var(--radius-clay-md)',
                    background: currentImpactTier.bg,
                    border: `2px solid`,
                    borderColor: `${currentImpactTier.color}30`,
                    transition: 'background 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--clay-navy)',
                        margin: '0 0 6px',
                      }}
                    >
                      {currentImpactTier.title}{' '}
                      <span style={{ color: currentImpactTier.color }}>({currentImpactTier.label})</span>
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--clay-navy-500)', margin: 0, lineHeight: 1.6 }}>
                      {currentImpactTier.desc}
                    </p>
                  </div>
                  {featuredCampaign && (
                    <Link
                      href={`/campaigns/${featuredCampaign._id}/donate-money?amount=${currentImpactTier.amount}`}
                      className="clay-btn-primary"
                      style={{ fontSize: 14, padding: '11px 22px', textDecoration: 'none', flexShrink: 0 }}
                    >
                      Ủng hộ mức này
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Campaigns ── */}
      <section style={{ padding: '0 24px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div>
              <div className="clay-section-tag" style={{ marginBottom: 12 }}>
                <TrendingUp className="w-3.5 h-3.5" />
                Chung tay vì cộng đồng
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(22px, 3.5vw, 32px)',
                  fontWeight: 700,
                  color: 'var(--clay-navy)',
                  margin: 0,
                }}
              >
                Chiến Dịch Thiện Nguyện Cần Chung Tay
              </h2>
            </div>
            <Link
              href="/campaigns"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 14,
                fontWeight: 800,
                color: 'var(--clay-green-deep)',
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              Xem tất cả ({campaigns.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Pills */}
          <div
            className="scrollbar-none"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 16,
              marginBottom: 24,
            }}
          >
            {CAUSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: 13,
                  fontWeight: selectedCategory === cat.id ? 800 : 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: selectedCategory === cat.id ? 'var(--clay-green)' : 'var(--clay-border)',
                  background: selectedCategory === cat.id ? 'var(--clay-green)' : 'var(--clay-surface)',
                  color: selectedCategory === cat.id ? '#fff' : 'var(--clay-navy-700)',
                  boxShadow: selectedCategory === cat.id ? 'var(--shadow-green)' : 'var(--shadow-clay-sm)',
                  transition: 'all 0.2s var(--ease-spring)',
                  fontFamily: 'var(--font-body)',
                  transform: selectedCategory === cat.id ? 'translateY(-2px)' : 'none',
                }}
              >
                {cat.label}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {filteredCampaigns.slice(0, 6).map((c) => (
                <CampaignCard key={c._id} campaign={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Top Donors Leaderboard ── */}
      {impactData?.topDonors && impactData.topDonors.length > 0 && (
        <section style={{ padding: '0 24px 72px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #1C1917 100%)',
                borderRadius: 'var(--radius-clay-xl)',
                padding: '56px 48px',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,.06)',
                boxShadow: 'var(--shadow-clay-xl)',
              }}
            >
              {/* Glow */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -80,
                  right: -80,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(251,191,36,.18) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ maxWidth: 540, marginBottom: 36, position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(251,191,36,.18)',
                    border: '1px solid rgba(251,191,36,.30)',
                    color: '#FCD34D',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: 16,
                  }}
                >
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  Bảng vàng vinh danh
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(22px, 4vw, 32px)',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 10px',
                  }}
                >
                  Những Trái Tim Vàng ReGive
                </h2>
                <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.6 }}>
                  Tri ân các nhà hảo tâm và mạnh thường quân đã đồng hành cùng ReGive trao tặng yêu thương.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 16,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {impactData.topDonors.map((donor, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,.06)',
                      border: '1.5px solid rgba(255,255,255,.10)',
                      borderRadius: 'var(--radius-clay-md)',
                      padding: '20px 16px',
                      textAlign: 'center',
                      transition: 'background 0.2s, transform 0.2s',
                    }}
                    className="hover:bg-white/10 hover:-translate-y-1"
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: idx === 0
                          ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                          : idx === 1
                          ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                          : idx === 2
                          ? 'linear-gradient(135deg, #CD7F32, #A0522D)'
                          : 'rgba(255,255,255,.12)',
                        margin: '0 auto 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: idx < 3 ? 20 : 14,
                        fontWeight: 900,
                        color: idx < 3 ? '#fff' : '#94A3B8',
                        boxShadow: idx === 0 ? '0 4px 0 rgba(251,191,36,.50), 0 8px 20px rgba(251,191,36,.25)' : 'none',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '3' : `#${idx + 1}`}
                    </div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 0 6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {donor.name}
                    </h4>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#FCD34D',
                        margin: '0 0 4px',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {formatVND(donor.totalAmount)}
                    </p>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{donor.count} lượt ủng hộ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Marketplace Spotlight ── */}
      <section style={{ padding: '0 24px 72px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              background: 'var(--clay-bg-soft)',
              borderRadius: 'var(--radius-clay-xl)',
              padding: '52px 48px',
              border: '2px solid rgba(34,197,94,.12)',
              boxShadow: 'var(--shadow-clay-md)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 36,
              }}
            >
              <div>
                <div className="clay-section-tag" style={{ marginBottom: 12 }}>
                  <Package className="w-3.5 h-3.5" />
                  Trao đổi & Gây quỹ
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(22px, 3.5vw, 32px)',
                    fontWeight: 700,
                    color: 'var(--clay-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Cửa Hàng Trao Tặng ReGive
                </h2>
                <p style={{ fontSize: 14, color: 'var(--clay-navy-500)', margin: 0, lineHeight: 1.6, maxWidth: 500 }}>
                  100% doanh thu từ mua bán vật phẩm tuần hoàn được chuyển thẳng vào quỹ cứu trợ chiến dịch.
                </p>
              </div>
              <Link
                href="/marketplace"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--clay-green-deep)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Xem chợ vật phẩm ({products.length})
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <CardSkeleton count={4} />
            ) : products.length === 0 ? (
              <EmptyState
                title="Cửa hàng đang được cập nhật"
                description="Các vật phẩm được quyên góp đang được kiểm định và chuẩn bị lên kệ."
                actionText="Quyên góp vật phẩm"
                actionHref="/campaigns"
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                {products.slice(0, 4).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Circular Charity Flow ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
            <div className="clay-section-tag" style={{ marginBottom: 16 }}>
              <Layers className="w-3.5 h-3.5" />
              Cách thức vận hành
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--clay-navy)',
                margin: '0 0 12px',
              }}
            >
              Mô Hình Thiện Nguyện Tuần Hoàn
            </h2>
            <p style={{ fontSize: 15, color: 'var(--clay-navy-500)', margin: 0, lineHeight: 1.7 }}>
              Mọi nguồn lực quyên góp đều được phân loại, kiểm định và tối ưu hóa đến tận tay người cần.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {FLOW_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="clay-card"
                style={{
                  padding: '36px 32px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Step number watermark */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 80,
                    fontWeight: 700,
                    color: `${step.color}14`,
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {step.num}
                </span>

                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 19,
                    fontWeight: 700,
                    color: 'var(--clay-navy)',
                    margin: '0 0 12px',
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--clay-navy-500)', lineHeight: 1.7, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Volunteer CTA Banner ── */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            style={{
              borderRadius: 'var(--radius-clay-xl)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #0F172A 0%, #14532D 50%, #0F172A 100%)',
              padding: '72px 56px',
              position: 'relative',
              boxShadow: 'var(--shadow-clay-xl)',
              border: '2px solid rgba(255,255,255,.06)',
            }}
          >
            {/* Decorative blobs */}
            <div
              aria-hidden="true"
              className="float-med"
              style={{
                position: 'absolute',
                top: -60,
                right: '10%',
                width: 250,
                height: 250,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -40,
                left: '5%',
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(96,165,250,.20) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ maxWidth: 620, position: 'relative', zIndex: 1 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(34,197,94,.20)',
                  border: '1px solid rgba(34,197,94,.35)',
                  color: '#4ADE80',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                <Smile className="w-3.5 h-3.5" />
                Đồng hành cùng ReGive
              </span>

              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(26px, 4.5vw, 44px)',
                  fontWeight: 700,
                  color: '#fff',
                  margin: '0 0 16px',
                  lineHeight: 1.2,
                }}
              >
                Trở Thành Tình Nguyện Viên ReGive Ngay Hôm Nay
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: '#A7F3D0',
                  lineHeight: 1.7,
                  margin: '0 0 36px',
                }}
              >
                Bạn có kỹ năng, thời gian hoặc trái tim nhiệt huyết? Hãy cùng chúng tôi tham gia phân loại vật phẩm,
                tổ chức sự kiện và mang niềm vui đến cho các em nhỏ và gia đình cần giúp đỡ.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Link
                  href="/campaigns"
                  className="clay-btn-primary"
                  style={{ fontSize: 15, padding: '13px 28px', textDecoration: 'none' }}
                >
                  <HandHeart className="w-4 h-4" />
                  Đăng ký tham gia chiến dịch
                </Link>
                <Link
                  href="/about"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '11px 26px',
                    borderRadius: 'var(--radius-pill)',
                    border: '2px solid rgba(255,255,255,.30)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,.08)',
                    transition: 'border-color 0.2s, background 0.2s',
                    fontFamily: 'var(--font-body)',
                  }}
                  className="hover:border-white hover:bg-white/15"
                >
                  Tìm hiểu thêm
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
