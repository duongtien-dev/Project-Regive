import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, RefreshCw, Users, Mail, Phone, MapPin } from 'lucide-react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Re<span className="text-emerald-400">Give</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              ReGive là nền tảng trao tặng và tuần hoàn thiện nguyện minh bạch, kết nối người cho đi,
              tình nguyện viên và người thụ hưởng nhằm tạo nên giá trị nhân văn bền vững.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Minh bạch tài chính</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/50 px-3 py-1.5 rounded-full">
                <RefreshCw className="w-4 h-4" />
                <span>Kinh tế tuần hoàn</span>
              </div>
            </div>
          </div>

          {/* Column 1: Khám phá */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/campaigns" className="hover:text-emerald-400 transition-colors">
                  Chiến dịch gây quỹ
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-emerald-400 transition-colors">
                  Cửa hàng trao tặng
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="hover:text-emerald-400 transition-colors">
                  Đăng ký tình nguyện
                </Link>
              </li>
              <li>
                <Link href="/support/new" className="hover:text-emerald-400 transition-colors">
                  Yêu cầu hỗ trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: ReGive */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Về ReGive
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  Giới thiệu sứ mệnh
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-emerald-400 transition-colors">
                  Chính sách & Điều khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Liên hệ */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Liên hệ & Hỗ trợ
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@regive.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1900 8888 (Miễn phí)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ReGive Platform. Đồng lòng sẻ chia yêu thương.</p>
          <p className="mt-2 sm:mt-0">Hệ thống thử nghiệm đồ án Capstone 2 - ReGive</p>
        </div>
      </div>
    </footer>
  );
};
