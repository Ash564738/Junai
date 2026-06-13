// src/app/api/sheet-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

function normalize(v: string | null | undefined) {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function toNull(value: unknown): string | null {
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

    const incomingTitle = toNull(row.title);
    const incomingSourceImageUrl =
      toNull(row.sourceImageUrl) ||
      toNull(row.imageUrl) ||
      toNull(row.cloudinaryUrl);

    const incomingFinalImageUrl =
      toNull(row.cloudinaryUrl) ||
      toNull(row.imageUrl) ||
      toNull(row.sourceImageUrl);

    if (!incomingTitle || !incomingFinalImageUrl) {
      skipped += 1;
      continue;
    }

    let existing:
      | {
          id: string;
          title: string;
          imageUrl: string | null;
          sourceImageUrl: string | null;
        }
      | null = null;

    if (row.contentKey) {
      existing = await prisma.content.findUnique({
        where: { contentKey: row.contentKey },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          sourceImageUrl: true,
        },
      });
    }

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

    if (normalize(existing.title) !== normalize(incomingTitle)) {
      console.log(
        `[sheet-images] title mismatch skipped: sheet=${row.sheetName} row=${row.sheetRow} existing="${existing.title}" incoming="${incomingTitle}"`
      );
      skipped += 1;
      continue;
    }

    if (
      normalize(existing.sourceImageUrl) === normalize(incomingSourceImageUrl) &&
      normalize(existing.imageUrl) === normalize(incomingFinalImageUrl)
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