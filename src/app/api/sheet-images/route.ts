// src/app/api/sheet-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SheetImageRow = {
  sheetName: string;
  sheetRow: number;
  imageUrl: string;
};

type Body = {
  rows?: SheetImageRow[];
};

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rows = Array.isArray(body.rows) ? body.rows : [];
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row?.sheetName || !Number.isFinite(row.sheetRow) || !row.imageUrl) {
      skipped += 1;
      continue;
    }

    const sourceKey = `${row.sheetName}:${row.sheetRow}`;

    const existing = await prisma.content.findUnique({
      where: { sourceKey },
      select: { id: true },
    });

    if (!existing) {
      skipped += 1;
      continue;
    }

    await prisma.content.updateMany({
      where: { sourceKey },
      data: {
        sourceImageUrl: row.imageUrl,
        imageUrl: row.imageUrl,
      },
    });

    updated += 1;
  }

  return NextResponse.json({
    ok: true,
    updated,
    skipped,
  });
}