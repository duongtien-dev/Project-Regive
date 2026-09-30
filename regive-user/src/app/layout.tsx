import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "ReGive — Nền Tảng Trao Tặng & Thiện Nguyện Tuần Hoàn",
  description:
    "ReGive kết nối các nhà hảo tâm, tình nguyện viên và người thụ hưởng trong một hệ sinh thái thiện nguyện minh bạch, bền vững.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col" style={{ background: 'var(--clay-bg)', color: 'var(--clay-navy)' }}>
        <AntdRegistry>
          <Providers>
            <AppHeader />
            <main className="flex-1">{children}</main>
            <AppFooter />
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
