// src/app/manhua/page.tsx
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
      title="Manhua"
      description="Danh sách manhua với bộ lọc theo độ khiết, thể loại và tình trạng."
      searchParams={params}
      defaultType="MANHUA"
    />
  );
}