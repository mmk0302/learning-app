import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ videoId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { videoId } = await params;
  await db.delete(videos).where(eq(videos.id, videoId));

  return NextResponse.json({ success: true });
}
