// src/components/content-browser.tsx
import Link from "next/link";
import prisma from "@/lib/prisma";
import { purityTagStyle, statusClass } from "@/lib/tag-colors";

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  TRUYEN_CHU: "Truyện chữ",
  MANGA: "Manga",
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  BL_COMIC: "BL",
  PHIM_ANIME: "Phim / Anime",
  DOUJINSHI: "Doujinshi",
  FANFIC: "Fanfic",
};

type SearchParamsLike = Record<string, string | string[] | undefined>;

type ContentBrowserProps = {
  title: string;
  description: string;
  searchParams?: SearchParamsLike;
  defaultType?: string;
};

type QueryState = {
  q: string;
  status: string;
  purity: string[];
  genre: string[];
  page: number;
};

const PAGE_SIZE = 24;
const STATUS_OPTIONS = [
  "Hoàn",
  "End",
  "On-going",
  "On-going dịch",
  "Chưa có bản dịch",
  "Drop",
  "Nhà dịch drop",
  "Nhà dịch bay màu",
] as const;

function getOne(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getMany(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildUrl(basePath: string, current: QueryState, patch: Partial<QueryState>) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.status) params.set("status", next.status);
  if (next.purity.length) params.set("purity", next.purity.join(","));
  if (next.genre.length) params.set("genre", next.genre.join(","));
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function badgeClass(type: string) {
  const map: Record<string, string> = {
    TRUYEN_CHU: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    MANGA: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
    MANHWA: "bg-sky-50 text-sky-700 ring-sky-600/20",
    MANHUA: "bg-orange-50 text-orange-700 ring-orange-600/20",
    BL_COMIC: "bg-pink-50 text-pink-700 ring-pink-600/20",
    PHIM_ANIME: "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
    DOUJINSHI: "bg-violet-50 text-violet-700 ring-violet-600/20",
    FANFIC: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
  return map[type] ?? "bg-zinc-100 text-zinc-600 ring-zinc-500/20";
}

function routeFromType(type: string) {
  const map: Record<string, string> = {
    TRUYEN_CHU: "truyen-chu",
    MANGA: "manga",
    MANHWA: "manhwa",
    MANHUA: "manhua",
    BL_COMIC: "truyen-tranh-bl",
    PHIM_ANIME: "phim-anime",
    DOUJINSHI: "doujinshi",
    FANFIC: "fanfic",
  };
  return map[type] ?? "";
}

function excerpt(text: string, max = 150) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trimEnd()}...`;
}

export async function ContentBrowser({
  title,
  description,
  searchParams = {},
  defaultType,
}: ContentBrowserProps) {
  const q = getOne(searchParams.q).trim();
  const status = getOne(searchParams.status).trim();
  const purity = getMany(searchParams.purity);
  const genre = getMany(searchParams.genre);
  const page = Math.max(1, Number(getOne(searchParams.page) || "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    AND: [
      defaultType ? { type: defaultType } : {},
      status ? { status } : {},
      purity.length ? { purityTags: { hasSome: purity } } : {},
      genre.length ? { genres: { hasSome: genre } } : {},
      q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { author: { contains: q, mode: "insensitive" as const } },
              { summary: { contains: q, mode: "insensitive" as const } },
              { cp: { contains: q, mode: "insensitive" as const } },
              { fanficTitle: { contains: q, mode: "insensitive" as const } },
              { doujinshiTitle: { contains: q, mode: "insensitive" as const } },
              { whereToAccess: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
    ],
  };

  const [totalCount, filteredCount, latestUpdated, items] = await Promise.all([
    prisma.content.count(),
    prisma.content.count({ where }),
    prisma.content.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.content.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        type: true,
        imageUrl: true,
        purityTags: true,
        status: true,
        genres: true,
        updatedAt: true,
        author: true,
        fanficTitle: true,
        doujinshiTitle: true,
        whereToAccess: true,
        summary: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const lastSyncText = latestUpdated
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(latestUpdated.updatedAt)
    : "Chưa có dữ liệu";

  const current: QueryState = { q, status, purity, genre, page };
  const activeBasePath = defaultType ? `/${routeFromType(defaultType)}` : "/";

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
          <p className="mt-2 text-base text-zinc-500">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Tổng nội dung" value={totalCount} />
          <StatCard label="Đang hiển thị" value={filteredCount} />
          <StatCard label="Cập nhật gần nhất" value={lastSyncText} />
        </div>
      </div>

      <form className="flex flex-wrap gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm kiếm..."
          className="min-w-[200px] flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-zinc-400"
        >
          <option value="">Tình trạng</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          name="purity"
          defaultValue={purity.join(",")}
          placeholder="Độ khiết (SK, Toàn khiết...)"
          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        <input
          name="genre"
          defaultValue={genre.join(",")}
          placeholder="Thể loại (Romance, Fantasy...)"
          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        <button
          type="submit"
          className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Lọc
        </button>
      </form>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Trang {page} / {totalPages} · {filteredCount} kết quả
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const visiblePurity = (item.purityTags ?? []).slice(0, 3);
            const visibleGenres = (item.genres ?? []).slice(0, 5);
            const moreGenres = Math.max(0, (item.genres ?? []).length - visibleGenres.length);

            return (
              <Link
                key={item.id}
                href={`/contents/${item.id}`}
                className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
              >
                <div className="aspect-[3/4] overflow-hidden bg-zinc-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image</div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${badgeClass(item.type)}`}
                    >
                      {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    {item.status && (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${statusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-zinc-600">
                      {item.title}
                    </h3>
                    {item.author && (
                      <p className="text-xs text-zinc-500">
                        Tác giả: <span className="font-medium text-zinc-700">{item.author}</span>
                      </p>
                    )}
                  </div>

                  {visiblePurity.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {visiblePurity.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md px-2 py-1 text-[11px] font-medium"
                          style={purityTagStyle(tag)}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.summary && (
                    <p className="text-xs leading-relaxed text-zinc-500">
                      {excerpt(item.summary, 120)}
                    </p>
                  )}

                  {visibleGenres.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {visibleGenres.map((g) => (
                        <span
                          key={g}
                          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-600"
                        >
                          {g}
                        </span>
                      ))}
                      {moreGenres > 0 && (
                        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-500">
                          +{moreGenres}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {items.length === 0 && (
            <div className="col-span-full rounded-2xl border border-zinc-200 bg-white py-16 text-center text-zinc-400 shadow-sm">
              Không tìm thấy nội dung phù hợp.
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <PaginationLink href={buildUrl(activeBasePath, current, { page: page - 1 })} disabled={page <= 1}>
            ← Trước
          </PaginationLink>
          <span className="text-sm text-zinc-600">
            {page} / {totalPages}
          </span>
          <PaginationLink href={buildUrl(activeBasePath, current, { page: page + 1 })} disabled={page >= totalPages}>
            Sau →
          </PaginationLink>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const baseClass = "rounded-xl border px-4 py-2 text-sm font-medium transition";
  if (disabled) {
    return (
      <span className={`${baseClass} cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300`}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={`${baseClass} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}>
      {children}
    </Link>
  );
}