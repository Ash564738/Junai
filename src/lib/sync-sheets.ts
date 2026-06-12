// src/lib/sync-sheets.ts
import { google } from "googleapis";
import prisma from "./prisma";
import {
  SHEET_MAPPING,
  COMMON_COLS,
  SHEET_NAMES,
  type SheetName,
  type ContentType,
} from "./sheet-mapping";

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID ?? "1SREzjYFG__kz-PUOdqMzMQEO3BVmOFOMdFijWzyszj0";
const DEFAULT_BATCH_SIZE = 100;
const HEADER_ROW_NUMBER = 3; // sheet row 3
const DATA_START_ROW_NUMBER = 4; // sheet row 4

export type SyncBatchResult = {
  ok: true;
  sheetName: SheetName;
  headerRowNumber: number;
  dataStartRowNumber: number;
  batchStart: number;
  batchSize: number;
  totalRows: number;
  done: boolean;
  nextBatch: number | null;
  processedRows: number;
  savedRows: number;
  skippedRows: number;
};

function log(...args: unknown[]) {
  console.log("[junai-sync]", ...args);
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function uniq(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function collectHeaderCandidates(mapping: (typeof SHEET_MAPPING)[SheetName]) {
  const specialCols = Object.values(mapping.specialCols).reduce<string[]>(
    (acc, cols) => acc.concat(cols),
    []
  );

  return uniq([
    ...mapping.titleCols,
    ...mapping.imageCols,
    ...mapping.genreCols,
    ...mapping.accessCols,
    ...specialCols,
    ...COMMON_COLS.purityTags,
    ...COMMON_COLS.status,
    ...COMMON_COLS.noteTags,
    ...COMMON_COLS.warningTags,
    ...COMMON_COLS.summary,
  ]);
}

function scoreHeaderRow(row: string[], candidates: string[]): number {
  const rowSet = new Set(row.map((v) => normalizeText(v)));
  let score = 0;

  for (const candidate of candidates) {
    if (rowSet.has(normalizeText(candidate))) score += 1;
  }

  return score;
}

function detectHeaderRow(
  rows: string[][],
  mapping: (typeof SHEET_MAPPING)[SheetName],
  sheetName: SheetName
) {
  const candidates = collectHeaderCandidates(mapping);

  const row3Index = HEADER_ROW_NUMBER - 1;
  const scanLimit = Math.min(10, rows.length);

  let bestIndex = row3Index;
  let bestScore = rows[row3Index]
    ? scoreHeaderRow(rows[row3Index], candidates)
    : -1;

  for (let i = 0; i < scanLimit; i++) {
    const row = rows[i] ?? [];
    const score = scoreHeaderRow(row, candidates);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  const headers = (rows[bestIndex] ?? []).map((h) => String(h).trim());

  log(`[${sheetName}] header detection`, {
    bestIndex,
    headerRowNumber: bestIndex + 1,
    bestScore,
    headersPreview: headers.slice(0, 12),
  });

  return {
    headerRowIndex: bestIndex,
    headerRowNumber: bestIndex + 1,
    dataStartRowIndex: bestIndex + 1,
    dataStartRowNumber: bestIndex + 2,
    headers,
    bestScore,
  };
}

function findHeaderIndex(headers: string[], candidates: string[]): number {
  const normalizedHeaders = headers.map(normalizeText);

  for (const candidate of candidates) {
    const idx = normalizedHeaders.indexOf(normalizeText(candidate));
    if (idx >= 0) return idx;
  }

  return -1;
}

function getCell(headers: string[], row: string[], candidates: string[]): string | null {
  const idx = findHeaderIndex(headers, candidates);
  if (idx < 0) return null;

  const value = row[idx];
  return value == null ? null : String(value).trim();
}

function parseMultiValue(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;|、]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractFirstUrl(text: string | null): string | null {
  if (!text) return null;

  const formulaHyperlink = text.match(/=HYPERLINK\(\s*"([^"]+)"/i);
  if (formulaHyperlink?.[1]) return formulaHyperlink[1];

  const formulaImage = text.match(/=IMAGE\(\s*"([^"]+)"/i);
  if (formulaImage?.[1]) return formulaImage[1];

  const match = text.match(/https?:\/\/[^\s"')<>]+/i);
  return match ? match[0] : null;
}

function extractDriveFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/i,
    /[?&]id=([a-zA-Z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function normalizeImageSource(raw: string | null): string | null {
  const url = extractFirstUrl(raw);
  if (!url) return null;

  const driveFileId = extractDriveFileId(url);
  if (driveFileId) {
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w1200`;
  }

  return url;
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function syncSheetBatch(
  sheetName: SheetName,
  batchStart: number,
  batchSize: number = DEFAULT_BATCH_SIZE
): Promise<SyncBatchResult> {
  const mapping = SHEET_MAPPING[sheetName];
  if (!mapping) throw new Error(`Unknown sheet: ${sheetName}`);

  const sheets = await getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:ZZ`,
    valueRenderOption: "FORMULA",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) {
    return {
      ok: true,
      sheetName,
      headerRowNumber: 0,
      dataStartRowNumber: 0,
      batchStart,
      batchSize,
      totalRows: 0,
      done: true,
      nextBatch: null,
      processedRows: 0,
      savedRows: 0,
      skippedRows: 0,
    };
  }

  const {
    headerRowNumber,
    dataStartRowIndex,
    dataStartRowNumber,
    headers,
    bestScore,
  } = detectHeaderRow(rows, mapping, sheetName);

  if (bestScore < 2) {
    log(`[${sheetName}] low header score`, {
      headerRowNumber,
      bestScore,
      preview: rows[HEADER_ROW_NUMBER - 1]?.slice(0, 12),
    });
  }

  const dataRows = rows.slice(dataStartRowIndex);
  const totalRows = dataRows.length;
  const end = Math.min(batchStart + batchSize, totalRows);
  const batchRows = dataRows.slice(batchStart, end);

  let processedRows = 0;
  let savedRows = 0;
  let skippedRows = 0;

  for (let i = 0; i < batchRows.length; i++) {
    const row = batchRows[i];
    const sheetRow = dataStartRowIndex + batchStart + i + 1; // 1-based row number
    const sourceKey = `${sheetName}:${sheetRow}`;

    const title = getCell(headers, row, mapping.titleCols);
    if (!title) {
      skippedRows += 1;
      continue;
    }

    processedRows += 1;

    const rawImage = getCell(headers, row, mapping.imageCols);
    const sourceImageUrl = normalizeImageSource(rawImage);

    const purityTags = parseMultiValue(getCell(headers, row, COMMON_COLS.purityTags));
    const status = getCell(headers, row, COMMON_COLS.status);
    const noteTags = parseMultiValue(getCell(headers, row, COMMON_COLS.noteTags));
    const warningTags = parseMultiValue(getCell(headers, row, COMMON_COLS.warningTags));
    const summary = getCell(headers, row, COMMON_COLS.summary);
    const genres = parseMultiValue(getCell(headers, row, mapping.genreCols));
    const whereToAccess = getCell(headers, row, mapping.accessCols);

    const specialData: Record<string, string | null> = {};
    for (const [field, candidates] of Object.entries(mapping.specialCols)) {
      specialData[field] = getCell(headers, row, candidates);
    }

    const existing = await prisma.content.findUnique({
      where: { sourceKey },
      select: {
        imageUrl: true,
        sourceImageUrl: true,
      },
    });

    const finalImageUrl = sourceImageUrl ?? existing?.imageUrl ?? null;
    const finalSourceImageUrl = sourceImageUrl ?? existing?.sourceImageUrl ?? null;

    await prisma.content.upsert({
      where: { sourceKey },
      create: {
        sourceKey,
        sheetName,
        sheetRow,
        type: mapping.type as ContentType,
        title,
        imageUrl: finalImageUrl,
        sourceImageUrl: finalSourceImageUrl,
        purityTags,
        status,
        noteTags,
        warningTags,
        genres,
        summary,
        whereToAccess,
        ...specialData,
      },
      update: {
        sheetRow,
        type: mapping.type as ContentType,
        title,
        imageUrl: finalImageUrl,
        sourceImageUrl: finalSourceImageUrl,
        purityTags,
        status,
        noteTags,
        warningTags,
        genres,
        summary,
        whereToAccess,
        ...specialData,
      },
    });

    savedRows += 1;
  }

  const done = end >= totalRows;
  const nextBatch = done ? null : batchStart + batchSize;

  return {
    ok: true,
    sheetName,
    headerRowNumber,
    dataStartRowNumber,
    batchStart,
    batchSize,
    totalRows,
    done,
    nextBatch,
    processedRows,
    savedRows,
    skippedRows,
  };
}

export async function syncWorkbook() {
  const summary = {
    ok: true as const,
    sheets: [] as Awaited<ReturnType<typeof syncSheetBatch>>[],
  };

  for (const sheetName of SHEET_NAMES) {
    let batchStart = 0;

    while (true) {
      const result = await syncSheetBatch(sheetName, batchStart, DEFAULT_BATCH_SIZE);
      summary.sheets.push(result);

      if (result.done || result.nextBatch === null) break;
      batchStart = result.nextBatch;
    }
  }

  return summary;
}