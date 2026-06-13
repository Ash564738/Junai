// src/app/truyen-tranh-bl/page.tsx
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
      title="Truyện tranh BL"
      description="Danh sách truyện tranh BL, hỗ trợ lọc và tìm kiếm nhanh."
      searchParams={params}
      defaultType="BL_COMIC"
    />
  );
}