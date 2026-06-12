// src/app/truyen-tranh-bl/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Truyện tranh BL"
      description="Danh sách truyện tranh BL, hỗ trợ lọc và tìm kiếm nhanh."
      searchParams={searchParams}
      defaultType="BL_COMIC"
    />
  );
}