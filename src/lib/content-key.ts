// src/lib/content-key.ts

import type { ContentType } from "./sheet-mapping";

function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function buildContentKey(input: {
  sheetName: string;
  type: ContentType;
  title: string | null;
  author?: string | null;
  cp?: string | null;
  originalWork?: string | null;
  doujinka?: string | null;
  fanficTitle?: string | null;
}): string {
  const secondary =
    input.author ??
    input.cp ??
    input.originalWork ??
    input.doujinka ??
    input.fanficTitle ??
    "";

  return [
    normalizeKey(input.sheetName),
    input.type,
    normalizeKey(input.title),
    normalizeKey(secondary),
  ].join("::");
}

export { normalizeKey };