// src/app/truyen-chu/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Truyện chữ"
      description="Danh sách truyện chữ được đồng bộ từ Google Sheets, có thể lọc theo độ khiết, tình trạng, thể loại và tìm kiếm theo từ khóa."
      searchParams={searchParams}
      defaultType="TRUYEN_CHU"
    />
  );
}