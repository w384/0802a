import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI NEWS · 今日资讯",
  description: "聚合模型、智能体、开源、研究与政策动态的 AI 资讯首页。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
