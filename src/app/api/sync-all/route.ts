// src/app/api/sync-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { syncWorkbookChunk, type SyncCursor } from "@/lib/sync-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authOk(request: NextRequest) {
  return request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

function parseCursorFromUrl(url: URL): SyncCursor | null {
  const sheetIndexRaw = url.searchParams.get("sheetIndex");
  const batchStartRaw = url.searchParams.get("batchStart");

  const sheetIndex = sheetIndexRaw === null ? NaN : Number.parseInt(sheetIndexRaw, 10);
  const batchStart = batchStartRaw === null ? NaN : Number.parseInt(batchStartRaw, 10);

  if (!Number.isFinite(sheetIndex) && !Number.isFinite(batchStart)) return null;

  return {
    sheetIndex: Number.isFinite(sheetIndex) ? sheetIndex : 0,
    batchStart: Number.isFinite(batchStart) ? batchStart : 0,
  };
}

async function handle(request: NextRequest) {
  if (!authOk(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let cursor: SyncCursor | null = null;
  let maxBatches = 2;

  if (request.method === "POST") {
    try {
      const body = await request.json();
      if (body?.cursor) {
        cursor = {
          sheetIndex: Number(body.cursor.sheetIndex) || 0,
          batchStart: Number(body.cursor.batchStart) || 0,
        };
      }
      if (body?.maxBatches !== undefined) {
        maxBatches = Math.max(1, Number(body.maxBatches) || 2);
      }
    } catch {
      cursor = null;
    }
  } else {
    cursor = parseCursorFromUrl(request.nextUrl);
    const qMax = request.nextUrl.searchParams.get("maxBatches");
    if (qMax !== null) maxBatches = Math.max(1, Number.parseInt(qMax, 10) || 2);
  }

  const result = await syncWorkbookChunk(cursor, maxBatches, 100);
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}