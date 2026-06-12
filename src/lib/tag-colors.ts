// src/lib/tag-colors.ts
import type { CSSProperties } from "react";

function style(bg: string, text: string, border?: string): CSSProperties {
  return {
    backgroundColor: bg,
    color: text,
    border: border ? `1px solid ${border}` : `1px solid ${bg}`,
    borderRadius: "6px",
    padding: "2px 8px",
    display: "inline-block",
  };
}

export function purityTagStyle(tag: string): CSSProperties {
  const t = tag.trim().toLowerCase();
  if (t.includes("không khuyến khích") || t.includes("lôi nặng"))
    return style("#fee2e2", "#991b1b", "#fecaca");
  if (t.includes("có lôi") || t.includes("kk dưa") || t.includes("kk cúc") || (t.includes("kk") && !t.includes("kk tâm")) || (t.includes("lôi") && !t.includes("lôi nặng")))
    return style("#ffedd5", "#9a3412", "#fed7aa");
  if (t.includes("không nhắc"))
    return style("#f3e8ff", "#6b21a8", "#e9d5ff");
  if (t.includes("kk tâm"))
    return style("#fef9c3", "#854d0e", "#fde047");
  if (t.includes("đọc kỹ note"))
    return style("#dbeafe", "#1e40af", "#bfdbfe");
  if (t.includes("sk") || t.includes("toàn khiết"))
    return style("#dcfce7", "#166534", "#bbf7d0");
  if (t.includes("khiết tâm") || t.includes("dưa") || t.includes("cúc"))
    return style("#f4f4f5", "#3f3f46", "#e4e4e7");
  if (t.includes("khiết"))
    return style("#dcfce7", "#166534", "#bbf7d0");
  return style("#f4f4f5", "#52525b", "#e4e4e7");
}

export function statusClass(status?: string | null) {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "hoàn" || s.includes("end"))
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (s.includes("on-going"))
    return "bg-sky-50 text-sky-700 ring-sky-600/20";
  if (s.includes("chưa có bản dịch"))
    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  if (s.includes("drop") || s.includes("bay màu"))
    return "bg-red-50 text-red-700 ring-red-600/20";
  return "bg-zinc-100 text-zinc-600 ring-zinc-500/20";
}