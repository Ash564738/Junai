// src/app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import SiteNavbar from "@/components/site-navbar";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Junai",
  description:
    "Web lọc truyện, anime, phim, doujinshi và fanfic theo độ khiết, thể loại và trạng thái.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${notoSans.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-white text-zinc-900 antialiased [font-family:var(--font-noto-sans),system-ui,sans-serif]">
        <SiteNavbar />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}