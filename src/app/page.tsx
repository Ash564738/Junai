// src/app/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export const dynamic = "force-dynamic"; // quan trọng để không cache dữ liệu

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ContentBrowser
      title="Tổng hợp nội dung"
      description="Tìm kiếm và lọc toàn bộ truyện, manga, manhwa, manhua, BL, phim/anime, doujinshi và fanfic."
      searchParams={params}
    />
  );
}