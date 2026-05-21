import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { generateId } from "@/lib/id";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { title, description, thumbnail, accessType, published, order } = body;

  if (!title) {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  const id = generateId();
  await db.insert(courses).values({
    id,
    title,
    description: description || null,
    thumbnail: thumbnail || null,
    accessType: accessType ?? "single",
    published: published ?? false,
    order: order ?? 0,
  });

  return NextResponse.json({ id });
}
