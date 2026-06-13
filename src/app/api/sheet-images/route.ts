// src/app/api/sheet-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildContentKey, normalizeKey } from "@/lib/content-key";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SheetImageRow = {
  sheetName: string;
  sheetRow: number;
  title?: string;
  contentKey?: string;
  sourceImageUrl?: string | null;
  cloudinaryUrl?: string | null;
  imageUrl?: string | null;
};

type Body = {
  rows?: SheetImageRow[];
};

function toText(value: unknown): string | null {
  const s = String(value ?? "").trim();
  return s ? s : null;
}

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

    const incomingTitle = toText(row.title);
    const incomingSourceImageUrl =
      toText(row.sourceImageUrl) ||
      toText(row.imageUrl) ||
      toText(row.cloudinaryUrl);

    const incomingFinalImageUrl =
      toText(row.cloudinaryUrl) ||
      toText(row.imageUrl) ||
      toText(row.sourceImageUrl);

    if (!incomingTitle || !incomingFinalImageUrl) {
      skipped += 1;
      continue;
    }

    const derivedContentKey =
      toText(row.contentKey) || buildContentKey(row.sheetName, row.sheetRow);

    let existing:
      | {
          id: string;
          title: string;
          imageUrl: string | null;
          sourceImageUrl: string | null;
        }
      | null = null;

    existing = await prisma.content.findUnique({
      where: { contentKey: derivedContentKey },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        sourceImageUrl: true,
      },
    });

    const usedFallback = !existing;

    if (!existing) {
      existing = await prisma.content.findFirst({
        where: {
          sheetName: row.sheetName,
          sheetRow: row.sheetRow,
          title: incomingTitle,
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          sourceImageUrl: true,
        },
      });
    }

    if (!existing) {
      skipped += 1;
      continue;
    }

    if (usedFallback && normalizeKey(existing.title) !== normalizeKey(incomingTitle)) {
      console.log(
        `[sheet-images] title mismatch skipped: sheet=${row.sheetName} row=${row.sheetRow} existing="${existing.title}" incoming="${incomingTitle}"`
      );
      skipped += 1;
      continue;
    }

    if (
      normalizeKey(existing.sourceImageUrl) === normalizeKey(incomingSourceImageUrl) &&
      normalizeKey(existing.imageUrl) === normalizeKey(incomingFinalImageUrl)
    ) {
      unchanged += 1;
      continue;
    }

    await prisma.content.update({
      where: { id: existing.id },
      data: {
        sourceImageUrl: incomingSourceImageUrl,
        imageUrl: incomingFinalImageUrl,
        sheetRow: row.sheetRow,
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