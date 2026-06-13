// src/app/manga/page.tsx
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
      title="Manga"
      description="Danh sách manga có thể lọc theo độ khiết, tình trạng và thể loại."
      searchParams={params}
      defaultType="MANGA"
    />
  );
}