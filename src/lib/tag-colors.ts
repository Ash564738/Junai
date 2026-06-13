// src/lib/tag-colors.ts
import type { CSSProperties } from "react";

function hexToRgba(hex: string, alpha = 0.14): string {
  const clean = hex.replace("#", "").trim();

  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function style(
  bg: string,
  text: string,
  border?: string,
  alpha = 0.14
): CSSProperties {
  return {
    backgroundColor: hexToRgba(bg, alpha),
    color: text,

    // dùng ring giống badge Hoàn
    boxShadow: `inset 0 0 0 1px ${border ?? bg}`,
  };
}

function normalizeTag(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function purityTagStyle(tag: string): CSSProperties {
  const t = normalizeTag(tag);

  if (
    t.includes("loi nang") ||
    t.includes("khong khuyen khich doc") ||
    t.includes("khong khuyen khich")
  ) {
    return style("#000000", "#ffffff", "#000000", 0.92);
  }

  if (t.includes("doc ky note")) {
    return style("#99e1ff", "#0f172a", "#99e1ff", 0.18);
  }

  if (t.includes("khong nhac") || t === "sk?" || t.includes("sk?")) {
    return style("#dd9cff", "#5b21b6", "#dd9cff", 0.18);
  }

  if (t.includes("kk tam")) {
    return style("#ffe5a0", "#7c4a03", "#ffe5a0", 0.18);
  }

  if (
    t.includes("sk tam than") ||
    t.includes("toan khiet tam than") ||
    t.includes("cp phu sk") ||
    t.includes("cac cp sk") ||
    t.includes("1/vai cp sk") ||
    t === "sk" ||
    (t.startsWith("sk ") && !t.includes("tam")) ||
    t.includes("toan khiet")
  ) {
    return style("#a5ffa5", "#14532d", "#a5ffa5", 0.18);
  }

  if (t.includes("co loi") || (t.includes("loi") && !t.includes("loi nang"))) {
    return style("#ff7c7c", "#7f1d1d", "#ff7c7c", 0.18);
  }

  if (t.includes("kk") && !t.includes("kk tam")) {
    return style("#ff7c7c", "#7f1d1d", "#ff7c7c", 0.18);
  }

  if (t.includes("sk tam") || t === "ck" || t === "tk" || t.includes("khiet")) {
    return style("#e8eaed", "#374151", "#e8eaed", 0.88);
  }

  if (t.includes("sk") || t.includes("toan khiet")) {
    return style("#a5ffa5", "#14532d", "#a5ffa5", 0.18);
  }

  return style("#f4f4f5", "#52525b", "#e4e4e7", 0.8);
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