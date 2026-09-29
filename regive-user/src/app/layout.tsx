import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
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
