// src/app/contents/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { CONTENT_TYPE_LABELS } from "@/components/content-browser";
import { purityTagStyle, statusClass } from "@/lib/tag-colors";

export const dynamic = "force-dynamic";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.content.findUnique({ where: { id } });

  if (!item) notFound();

  const noteText = (item.noteTags ?? []).join("\n");
  const warningText = (item.warningTags ?? []).join("\n");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900">
        ← Quay lại
      </Link>

      <article className="grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center text-sm text-zinc-400">No image</div>
            )}
          </div>

          {item.whereToAccess && (
            <a
              href={item.whereToAccess}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Mở nơi đọc / xem
            </a>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {CONTENT_TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(item.status)}`}>
              {item.status ?? "Không rõ"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{item.title}</h1>
            {item.author && <p className="text-sm text-zinc-500">Tác giả: {item.author}</p>}
          </div>

          {(item.purityTags ?? []).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Độ khiết / cảnh báo</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.purityTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                    style={purityTagStyle(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {item.fanficTitle && <InfoRow label="Tên fanfic" value={item.fanficTitle} />}
            {item.doujinshiTitle && <InfoRow label="Tên doujinshi" value={item.doujinshiTitle} />}
            {item.doujinka && <InfoRow label="Doujinka" value={item.doujinka} />}
            {item.cp && <InfoRow label="CP" value={item.cp} />}
            {item.originalWork && <InfoRow label="Tác phẩm gốc" value={item.originalWork} />}
            {item.xuatBan && <InfoRow label="Xuất bản" value={item.xuatBan} />}
            {item.whereToAccess && <InfoRow label="Nơi đọc / xem" value={item.whereToAccess} />}
          </div>

          {(item.summary || item.genres.length > 0) && (
            <div className="space-y-6">
              {item.summary && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tóm tắt / review</h2>
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
                    {item.summary}
                  </p>
                </div>
              )}

              {item.genres.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Thể loại</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.genres.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {item.noteTags.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                NOTE: Bằng chứng khiết/KK
              </h2>
              <div className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-blue-700">
                {noteText}
              </div>
            </div>
          )}

          {item.warningTags.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Lôi / bom mìn
              </h2>
              <div className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-red-700">
                {warningText}
              </div>
            </div>
          )}
        </div>
      </article>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
        Phần review, bình luận và chat sẽ gắn vào đây sau khi bật auth.
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-zinc-800">{value}</div>
    </div>
  );
}