// src/components/site-navbar.tsx
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Truyện chữ", href: "/truyen-chu" },
  { label: "Manga", href: "/manga" },
  { label: "Manhwa", href: "/manhwa" },
  { label: "Manhua", href: "/manhua" },
  { label: "BL", href: "/truyen-tranh-bl" },
  { label: "Anime", href: "/phim-anime" },
  { label: "Doujinshi", href: "/doujinshi" },
  { label: "Fanfic", href: "/fanfic" },
] as const;

export default function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
            Junai
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}