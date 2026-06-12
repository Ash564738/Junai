// src/app/api/cron/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { syncWorkbookChunk } from "@/lib/sync-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetIndex = Number.parseInt(
    request.nextUrl.searchParams.get("sheetIndex") ?? "0",
    10
  );

  const batchStart = Number.parseInt(
    request.nextUrl.searchParams.get("batchStart") ?? "0",
    10
  );

  const maxBatches = Number.parseInt(
    request.nextUrl.searchParams.get("maxBatches") ?? "2",
    10
  );

  const result = await syncWorkbookChunk(
    {
      sheetIndex: Number.isFinite(sheetIndex) ? sheetIndex : 0,
      batchStart: Number.isFinite(batchStart) ? batchStart : 0,
    },
    Number.isFinite(maxBatches) ? maxBatches : 2,
    100
  );

  return NextResponse.json(result);
}