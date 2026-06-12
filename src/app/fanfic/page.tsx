// src/app/fanfic/page.tsx
import { ContentBrowser } from "@/components/content-browser";

export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <ContentBrowser
      title="Fanfic"
      description="Danh sách fanfic theo cp, tác giả, độ khiết, tình trạng và thể loại."
      searchParams={searchParams}
      defaultType="FANFIC"
    />
  );
}