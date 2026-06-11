// src/app/api/cron/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { syncWorkbook } from "@/lib/sync-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncWorkbook();
  return NextResponse.json(result);
}