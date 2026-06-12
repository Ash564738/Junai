// src/app/api/sync-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { syncWorkbookChunk, type SyncCursor } from "@/lib/sync-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAuth(request: NextRequest) {
  return request.headers.get("authorization") ?? "";
}

function readCursorFromUrl(url: URL): SyncCursor | null {
  const sheetIndex = Number.parseInt(url.searchParams.get("sheetIndex") ?? "", 10);
  const batchStart = Number.parseInt(url.searchParams.get("batchStart") ?? "", 10);

  if (!Number.isFinite(sheetIndex) && !Number.isFinite(batchStart)) return null;

  return {
    sheetIndex: Number.isFinite(sheetIndex) ? sheetIndex : 0,
    batchStart: Number.isFinite(batchStart) ? batchStart : 0,
  };
}

async function handle(request: NextRequest) {
  const authHeader = getAuth(request);
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bodyCursor: SyncCursor | null = null;
  let maxBatches = 2;

  if (request.method === "POST") {
    try {
      const body = await request.json();
      if (body?.cursor) {
        bodyCursor = {
          sheetIndex: Number(body.cursor.sheetIndex) || 0,
          batchStart: Number(body.cursor.batchStart) || 0,
        };
      }
      if (Number.isFinite(Number(body?.maxBatches))) {
        maxBatches = Math.max(1, Number(body.maxBatches));
      }
    } catch {
      bodyCursor = null;
    }
  } else {
    bodyCursor = readCursorFromUrl(request.nextUrl);
    const qMax = Number.parseInt(request.nextUrl.searchParams.get("maxBatches") ?? "", 10);
    if (Number.isFinite(qMax)) maxBatches = Math.max(1, qMax);
  }

  const result = await syncWorkbookChunk(bodyCursor, maxBatches, 100);

  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}