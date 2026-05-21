import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { sections } from "@/db/schema";
import { generateId } from "@/lib/id";

type Params = { params: Promise<{ courseId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { courseId } = await params;
  const { title, order } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(sections).values({ id, courseId, title, order: order ?? 0 });

  return NextResponse.json({ id, courseId, title, order: order ?? 0, videos: [] });
}
