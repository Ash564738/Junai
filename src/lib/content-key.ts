// src/lib/content-key.ts

export function normalizeKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function buildContentKey(sheetName: string, sheetRow: number): string {
  return `${normalizeKey(sheetName)}::${sheetRow}`;
}

export function buildSourceKey(sheetName: string, sheetRow: number): string {
  return `${sheetName}:${sheetRow}`;
}