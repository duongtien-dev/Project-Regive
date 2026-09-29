import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, RefreshCw, Mail, Phone, MapPin, Sprout } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer
      style={{
        background: 'var(--clay-navy)',
        color: '#CBD5E1',
        paddingTop: 72,
        paddingBottom: 40,
        fontFamily: 'var(--font-body)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 40,
            paddingBottom: 48,
            borderBottom: '1px solid rgba(255,255,255,.08)',
          }}
        >
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 16 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, var(--clay-green) 0%, var(--clay-mint) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-green)',
                }}
              >
                <Heart className="w-6 h-6 fill-white text-white" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                }}
              >
                Re<span style={{ color: 'var(--clay-mint)' }}>Give</span>
              </span>
            </Link>

            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#94A3B8', maxWidth: 340, marginBottom: 20 }}>
              ReGive là nền tảng trao tặng và tuần hoàn thiện nguyện minh bạch, kết nối người cho đi,
              tình nguyện viên và người thụ hưởng nhằm tạo nên giá trị nhân văn bền vững.
            </p>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(34,197,94,.12)',
                  border: '1px solid rgba(34,197,94,.25)',
                  color: 'var(--clay-mint)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <ShieldCheck className="w-4 h-4" />
                100% Minh bạch tài chính
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(96,165,250,.12)',
                  border: '1px solid rgba(96,165,250,.25)',
                  color: 'var(--clay-sky)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Sprout className="w-4 h-4" />
                Kinh tế tuần hoàn
              </div>
            </div>
          </div>

          {/* Khám phá */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Khám phá
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { href: '/campaigns', label: '🌱 Chiến dịch gây quỹ' },
                { href: '/marketplace', label: '🛍️ Cửa hàng trao tặng' },
                { href: '/transparency', label: '📊 Sổ cái minh bạch', highlight: true },
                { href: '/campaigns', label: '🤝 Đăng ký tình nguyện' },
                { href: '/support/new', label: '🆘 Yêu cầu hỗ trợ' },
              ].map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: 14,
                      color: item.highlight ? 'var(--clay-mint)' : '#94A3B8',
                      fontWeight: item.highlight ? 700 : 500,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    className="hover:text-green-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Về ReGive */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Về ReGive
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { href: '/about', label: '💚 Giới thiệu sứ mệnh' },
                { href: '/faq', label: '❓ Câu hỏi thường gặp' },
                { href: '/policy', label: '📋 Chính sách & Điều khoản' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: 14,
                      color: '#94A3B8',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    className="hover:text-green-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Liên hệ & Hỗ trợ
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--clay-mint)' }} />
                <span style={{ fontSize: 14, color: '#94A3B8' }}>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--clay-sky)' }} />
                <span style={{ fontSize: 14, color: '#94A3B8' }}>support@regive.vn</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--clay-coral)' }} />
                <span style={{ fontSize: 14, color: '#94A3B8' }}>1900 8888 (Miễn phí)</span>
              </li>
            </ul>

            {/* CTA mini */}
            <Link
              href="/campaigns"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 20,
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, var(--clay-green), var(--clay-mint))',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-green)',
                fontFamily: 'var(--font-body)',
                transition: 'opacity 0.2s',
              }}
              className="hover:opacity-90"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Ủng hộ ngay
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: 28,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            © {new Date().getFullYear()} <span style={{ color: 'var(--clay-mint)', fontWeight: 700 }}>ReGive</span> Platform —
            Đồng lòng sẻ chia yêu thương 💚
          </p>
          <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>
            Đồ án Capstone 2 · ReGive Community Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
