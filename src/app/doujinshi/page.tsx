// src/app/doujinshi/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Doujinshi"
      description="Danh sách doujinshi theo cp, tên gốc, doujinka, độ khiết và thể loại."
      searchParams={searchParams}
      defaultType="DOUJINSHI"
    />
  );
}