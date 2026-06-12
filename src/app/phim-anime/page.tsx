// src/app/phim-anime/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Phim / Anime"
      description="Danh sách phim và anime được phân loại theo sheet riêng."
      searchParams={searchParams}
      defaultType="PHIM_ANIME"
    />
  );
}