import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Atelier｜AI 面試模擬顧問",
  description: "貼上職缺描述，與 AI 面試顧問進行一對一模擬面試，逐題獲得回答建議與綜合評分。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* 根 layout 會套用到所有頁面；next/font 在 Turbopack 下無法處理 Noto CJK 字型 */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;700&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
