// src/app/manhwa/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Manhwa"
      description="Danh sách manhwa được đồng bộ từ Google Sheets."
      searchParams={searchParams}
      defaultType="MANHWA"
    />
  );
}