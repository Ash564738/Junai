// src/app/page.tsx
import prisma from "@/lib/prisma";

type SearchParams = {
  q?: string;
  type?: string;
  sheet?: string;
};

const CONTENT_TYPES = [
  { value: "TRUYEN_CHU", label: "Truyện chữ" },
  { value: "MANGA", label: "Manga" },
  { value: "MANHWA", label: "Manhwa" },
  { value: "MANHUA", label: "Manhua" },
  { value: "BL_COMIC", label: "Truyện tranh BL" },
  { value: "PHIM_ANIME", label: "Phim / Anime" },
  { value: "DOUJINSHI", label: "Doujinshi" },
  { value: "FANFIC", label: "Fanfic" },
] as const;

function toStringValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function prettyType(value: string) {
  const found = CONTENT_TYPES.find((item) => item.value === value);
  return found?.label ?? value;
}

function typeBadgeClass(type: string) {
  switch (type) {
    case "TRUYEN_CHU":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "MANGA":
      return "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200";
    case "MANHWA":
      return "border-sky-500/30 bg-sky-500/10 text-sky-200";
    case "MANHUA":
      return "border-orange-500/30 bg-orange-500/10 text-orange-200";
    case "BL_COMIC":
      return "border-pink-500/30 bg-pink-500/10 text-pink-200";
    case "PHIM_ANIME":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "DOUJINSHI":
      return "border-violet-500/30 bg-violet-500/10 text-violet-200";
    case "FANFIC":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    default:
      return "border-zinc-700 bg-zinc-800 text-zinc-200";
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const q = toStringValue(searchParams.q).trim();
  const type = toStringValue(searchParams.type).trim();
  const sheet = toStringValue(searchParams.sheet).trim();

  const where = {
    AND: [
      type ? { type } : {},
      sheet ? { sheetName: sheet } : {},
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { author: { contains: q, mode: "insensitive" as const } },
              { summary: { contains: q, mode: "insensitive" as const } },
              { cp: { contains: q, mode: "insensitive" as const } },
              { fanficTitle: { contains: q, mode: "insensitive" as const } },
              {
                doujinshiTitle: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {},
    ],
  };
  const [totalCount, filteredCount, latestUpdated, typeStats, sheetStats, items] =
    await Promise.all([
      prisma.content.count(),
      prisma.content.count({ where }),
      prisma.content.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
      prisma.content.groupBy({
        by: ["type"],
        _count: {
          id: true,
        },
      }),
      prisma.content.groupBy({
        by: ["sheetName"],
        _count: {
          id: true,
        },
      }),
      prisma.content.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
          id: true,
          title: true,
          type: true,
          imageUrl: true,
          sourceImageUrl: true,
          purityTags: true,
          status: true,
          sheetName: true,
          updatedAt: true,
          author: true,
          fanficTitle: true,
          doujinshiTitle: true,
          whereToAccess: true,
        },
      }),
    ]);

  const lastSyncText = latestUpdated
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(latestUpdated.updatedAt)
    : "Chưa có dữ liệu";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_32%),linear-gradient(to_bottom,_#09090b,_#0a0a0b)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-wide text-cyan-200">
                Junai Content Hub
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Dashboard lọc truyện, anime, phim, doujinshi và fanfic
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                Dữ liệu lấy từ Google Sheets, đồng bộ vào PostgreSQL, rồi hiển thị
                dưới dạng danh mục có thể tìm kiếm và lọc theo loại, sheet, độ khiết,
                trạng thái và nội dung.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <StatCard label="Tổng nội dung" value={totalCount} />
              <StatCard label="Đang hiển thị" value={filteredCount} />
              <StatCard label="Lần cập nhật" value={lastSyncText} small />
            </div>
          </div>

          <form className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_0.7fr_0.7fr_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm tên truyện, tác giả, cp, summary..."
              className="h-12 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 text-sm text-white outline-none ring-0 placeholder:text-zinc-500 focus:border-cyan-400/40"
            />
            <select
              name="type"
              defaultValue={type}
              className="h-12 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 text-sm text-white outline-none focus:border-cyan-400/40"
            >
              <option value="">Tất cả loại</option>
              {CONTENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              name="sheet"
              defaultValue={sheet}
              placeholder="Tên sheet"
              className="h-12 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/40"
            />
            <button
              type="submit"
              className="h-12 rounded-2xl bg-cyan-400 px-5 text-sm font-medium text-zinc-950 transition hover:bg-cyan-300"
            >
              Lọc dữ liệu
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            <FilterChip label="Tất cả" href="/" active={!q && !type && !sheet} />
            {CONTENT_TYPES.map((item) => (
              <FilterChip
                key={item.value}
                label={item.label}
                href={`/?type=${encodeURIComponent(item.value)}`}
                active={type === item.value}
              />
            ))}
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {typeStats.map((item) => (
            <div
              key={item.type}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10"
            >
              <p className="text-sm text-zinc-400">{prettyType(item.type)}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {item._count.id}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${Math.max(
                      6,
                      Math.min(100, (item._count.id / Math.max(totalCount, 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Mới cập nhật</h2>
                <p className="text-sm text-zinc-400">
                  12 mục mới nhất sau khi đồng bộ.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 sm:grid-cols-[92px_1fr]"
                >
                  <div className="h-[120px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${typeBadgeClass(
                          item.type
                        )}`}
                      >
                        {prettyType(item.type)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {item.sheetName}
                      </span>
                      {item.status ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                          {item.status}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-3 truncate text-base font-semibold text-white">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
                      {item.author ? <span>Tác giả: {item.author}</span> : null}
                      {item.fanficTitle ? (
                        <span>Fanfic: {item.fanficTitle}</span>
                      ) : null}
                      {item.doujinshiTitle ? (
                        <span>Doujinshi: {item.doujinshiTitle}</span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(item.purityTags ?? []).slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 text-xs text-zinc-500">
                      Cập nhật:{" "}
                      {new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(item.updatedAt)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
              <h2 className="text-lg font-semibold text-white">Theo sheet</h2>
              <div className="mt-4 space-y-3">
                {sheetStats.map((item) => (
                  <div
                    key={item.sheetName}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-300">{item.sheetName}</span>
                    <span className="text-sm font-semibold text-white">
                      {item._count.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/10">
              <h2 className="text-lg font-semibold text-white">Trạng thái hệ thống</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                <li>Google Sheets → PostgreSQL: hoạt động</li>
                <li>Sync theo batch: hoạt động</li>
                <li>Cloudinary upload: sẵn sàng</li>
                <li>Vercel Cron: sẵn sàng deploy</li>
              </ul>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 px-4 py-3">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`mt-1 font-semibold text-white ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-cyan-400/30 bg-cyan-400 text-zinc-950"
          : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
      }`}
    >
      {label}
    </a>
  );
}