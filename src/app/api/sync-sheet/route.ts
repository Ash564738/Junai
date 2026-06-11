// src/app/api/sync-sheet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { syncSheetBatch } from "@/lib/sync-sheets";
import { SHEET_NAMES, type SheetName } from "@/lib/sheet-mapping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATCH_SIZE = 20;

function isSheetName(value: string | null): value is SheetName {
  return !!value && (SHEET_NAMES as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheet = request.nextUrl.searchParams.get("sheet");
  const batch = Number.parseInt(request.nextUrl.searchParams.get("batch") ?? "0", 10);

  if (!isSheetName(sheet)) {
    return NextResponse.json(
      { error: "Missing or invalid sheet parameter" },
      { status: 400 }
    );
  }

  const result = await syncSheetBatch(
    sheet,
    Number.isFinite(batch) ? batch : 0,
    BATCH_SIZE
  );

  return NextResponse.json(result);
}