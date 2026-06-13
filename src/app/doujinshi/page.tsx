// src/app/doujinshi/page.tsx
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
      title="Doujinshi"
      description="Danh sách doujinshi theo cp, tên gốc, doujinka, độ khiết và thể loại."
      searchParams={params}
      defaultType="DOUJINSHI"
    />
  );
}