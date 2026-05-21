import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { generateId } from "@/lib/id";

type Params = { params: Promise<{ sectionId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { sectionId } = await params;
  const { title, youtubeId, description, duration, order } = await req.json();

  if (!title || !youtubeId) {
    return NextResponse.json({ error: "タイトルとYouTube IDは必須です" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(videos).values({
    id,
    sectionId,
    title,
    youtubeId,
    description: description || null,
    duration: duration || null,
    order: order ?? 0,
  });

  return NextResponse.json({ id, sectionId, title, youtubeId, description: description || null, duration: duration || null, order: order ?? 0 });
}
