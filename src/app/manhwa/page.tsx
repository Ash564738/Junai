// src/app/manhwa/page.tsx
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
      title="Manhwa"
      description="Danh sách manhwa được đồng bộ từ Google Sheets."
      searchParams={params}
      defaultType="MANHWA"
    />
  );
}