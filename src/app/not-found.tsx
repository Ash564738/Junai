// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-semibold">Không tìm thấy nội dung</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Trang hoặc mục bạn mở không còn tồn tại.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-zinc-950"
        >
          Về trang chủ
        </Link>
      </div>
    </main>
  );
}