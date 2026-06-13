// src/app/api/sheet-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SheetImageRow = {
  sheetName: string;
  sheetRow: number;
  title?: string;
  sourceImageUrl?: string | null;
  cloudinaryUrl?: string | null;
  imageUrl?: string | null;
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
  let unchanged = 0;

  for (const row of rows) {
    if (!row?.sheetName || !Number.isFinite(row.sheetRow)) {
      skipped += 1;
      continue;
    }

    const sourceKey = `${row.sheetName}:${row.sheetRow}`;

    const existing = await prisma.content.findUnique({
      where: { sourceKey },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        sourceImageUrl: true,
      },
    });

    if (!existing) {
      skipped += 1;
      continue;
    }

    const incomingSourceImageUrl =
      (row.sourceImageUrl && row.sourceImageUrl.trim()) ||
      (row.imageUrl && row.imageUrl.trim()) ||
      (row.cloudinaryUrl && row.cloudinaryUrl.trim()) ||
      null;

    const incomingFinalImageUrl =
      (row.cloudinaryUrl && row.cloudinaryUrl.trim()) ||
      (row.imageUrl && row.imageUrl.trim()) ||
      (row.sourceImageUrl && row.sourceImageUrl.trim()) ||
      null;

    if (!incomingFinalImageUrl) {
      skipped += 1;
      continue;
    }

    if (
      existing.sourceImageUrl === incomingSourceImageUrl &&
      existing.imageUrl === incomingFinalImageUrl
    ) {
      unchanged += 1;
      continue;
    }

    if (row.title && existing.title && row.title.trim() !== existing.title.trim()) {
      console.log(
        `[sheet-images] title changed at ${sourceKey}: existing="${existing.title}" incoming="${row.title}"`
      );
    }

    await prisma.content.update({
      where: { sourceKey },
      data: {
        sourceImageUrl: incomingSourceImageUrl,
        imageUrl: incomingFinalImageUrl,
      },
    });

    updated += 1;
  }

  return NextResponse.json({
    ok: true,
    updated,
    skipped,
    unchanged,
  });
}