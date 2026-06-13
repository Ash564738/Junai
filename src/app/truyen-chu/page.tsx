// src/app/truyen-chu/page.tsx
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
      title="Truyện chữ"
      description="Danh sách truyện chữ được đồng bộ từ Google Sheets, có thể lọc theo độ khiết, tình trạng, thể loại và tìm kiếm theo từ khóa."
      searchParams={params}
      defaultType="TRUYEN_CHU"
    />
  );
}