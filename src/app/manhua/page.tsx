// src/app/manhua/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Manhua"
      description="Danh sách manhua với bộ lọc theo độ khiết, thể loại và tình trạng."
      searchParams={searchParams}
      defaultType="MANHUA"
    />
  );
}