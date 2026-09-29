import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import "./globals.css";

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
    <html lang="vi" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
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
