// src/app/manga/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Manga"
      description="Danh sách manga có thể lọc theo độ khiết, tình trạng và thể loại."
      searchParams={searchParams}
      defaultType="MANGA"
    />
  );
}