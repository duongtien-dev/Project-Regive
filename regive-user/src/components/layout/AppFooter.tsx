import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Mail, Phone, MapPin, Sprout } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="bg-white text-n-s600 pt-16 pb-10 relative overflow-hidden border-t border-n-s100">
      {/* Decorative blobs */}
      <div
        className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-[radial-gradient(circle,rgba(24,201,255,0.16)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[radial-gradient(circle,rgba(107,211,243,0.14)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-n-s100">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-3 no-underline mb-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-p-s500 to-p-s400 flex items-center justify-center shadow-lg shadow-p-s500/25 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white text-white" />
              </div>
              <span className="font-bold text-2xl text-n-s900 tracking-tight">
                Re<span className="text-p-s600">Give</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-n-s500 max-w-sm mb-5">
              ReGive là nền tảng trao tặng và tuần hoàn thiện nguyện minh bạch, kết nối người cho đi,
              tình nguyện viên và người thụ hưởng nhằm tạo nên giá trị nhân văn bền vững.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-p-s100 border border-p-s200 text-p-s700 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                100% Minh bạch tài chính
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-i-s100 border border-i-s200 text-i-s700 text-xs font-bold">
                <Sprout className="w-4 h-4" />
                Kinh tế tuần hoàn
              </div>
            </div>
          </div>

          {/* Khám phá */}
          <div>
            <h4 className="font-bold text-sm text-n-s900 tracking-wider uppercase mb-5">
              Khám phá
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                { href: '/campaigns', label: 'Chiến dịch gây quỹ' },
                { href: '/marketplace', label: 'Cửa hàng trao tặng' },
                { href: '/transparency', label: 'Sổ cái minh bạch', highlight: true },
                { href: '/campaigns', label: 'Đăng ký tình nguyện' },
                { href: '/support/new', label: 'Yêu cầu hỗ trợ' },
              ].map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className={`text-sm no-underline transition-colors ${
                      item.highlight
                        ? 'text-p-s600 font-bold hover:text-p-s700'
                        : 'text-n-s500 font-medium hover:text-p-s600'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Về ReGive */}
          <div>
            <h4 className="font-bold text-sm text-n-s900 tracking-wider uppercase mb-5">
              Về ReGive
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {[
                { href: '/about', label: 'Giới thiệu sứ mệnh' },
                { href: '/faq', label: 'Câu hỏi thường gặp' },
                { href: '/policy', label: 'Chính sách & Điều khoản' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-n-s500 font-medium no-underline hover:text-p-s600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="font-bold text-sm text-n-s900 tracking-wider uppercase mb-5">
              Liên hệ & Hỗ trợ
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-p-s500" />
                <span className="text-sm text-n-s500">Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-i-s500" />
                <span className="text-sm text-n-s500">support@regive.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-sec-s600" />
                <span className="text-sm text-n-s500">1900 8888 (Miễn phí)</span>
              </li>
            </ul>

            {/* CTA mini */}
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-p-s500 hover:bg-p-s600 text-white text-xs font-bold no-underline shadow-md shadow-p-s500/30 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              Ủng hộ ngay
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-n-s400 m-0">
            © {new Date().getFullYear()}{' '}
            <span className="text-p-s600 font-bold">ReGive</span> Platform — Đồng lòng sẻ chia yêu thương
          </p>
          <p className="text-xs text-n-s500 m-0">
            Đồ án Capstone 2 · ReGive Community Platform
          </p>
        </div>
      </div>
    </footer>
  );
};
