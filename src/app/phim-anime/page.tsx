// src/app/phim-anime/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <ContentBrowser
      title="Phim / Anime"
      description="Danh sách phim và anime được phân loại theo sheet riêng."
      searchParams={params}
      defaultType="PHIM_ANIME"
    />
  );
}