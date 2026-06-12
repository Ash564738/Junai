// src/app/contents/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { CONTENT_TYPE_LABELS } from "@/components/content-browser";
import { purityTagStyle, statusClass } from "@/lib/tag-colors";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.content.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900">
        ← Quay lại
      </Link>

      <article className="grid gap-8 md:grid-cols-[280px_1fr]">
        {/* Ảnh + nút truy cập */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
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
              className="block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Mở nơi đọc / xem
            </a>
          )}
        </div>

        {/* Thông tin */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
              {CONTENT_TYPE_LABELS[item.type] ?? item.type}
            </span>
            <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(item.status)}`}>
              {item.status ?? "Không rõ"}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{item.title}</h1>

          {(item.purityTags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.purityTags.map(tag => (
                <span key={tag} className="rounded-md px-2 py-1 text-xs font-medium" style={purityTagStyle(tag)}>{tag}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {item.author && <InfoRow label="Tác giả" value={item.author} />}
            {item.fanficTitle && <InfoRow label="Tên fanfic" value={item.fanficTitle} />}
            {item.doujinshiTitle && <InfoRow label="Tên doujinshi" value={item.doujinshiTitle} />}
            {item.doujinka && <InfoRow label="Doujinka" value={item.doujinka} />}
            {item.cp && <InfoRow label="CP" value={item.cp} />}
            {item.originalWork && <InfoRow label="Tác phẩm gốc" value={item.originalWork} />}
            {item.xuatBan && <InfoRow label="Xuất bản" value={item.xuatBan} />}
            {item.whereToAccess && <InfoRow label="Nơi đọc / xem" value={item.whereToAccess} />}
          </div>

          {item.genres.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Thể loại</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.genres.map(g => (
                  <span key={g} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">{g}</span>
                ))}
              </div>
            </div>
          )}

          {item.noteTags.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Đọc kỹ NOTE</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.noteTags.map(g => (
                  <span key={g} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">{g}</span>
                ))}
              </div>
            </div>
          )}

          {item.warningTags.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Lôi / bom mìn</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.warningTags.map(g => (
                  <span key={g} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700">{g}</span>
                ))}
              </div>
            </div>
          )}

          {item.summary && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tóm tắt / review</h2>
              <p className="mt-2 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700">
                {item.summary}
              </p>
            </div>
          )}
        </div>
      </article>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
        Phần review, bình luận và chat sẽ gắn vào đây sau khi bật auth.
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-zinc-800">{value}</div>
    </div>
  );
}