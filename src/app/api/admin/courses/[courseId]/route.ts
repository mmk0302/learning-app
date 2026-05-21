import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ courseId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { courseId } = await params;
  const body = await req.json();
  const { title, description, thumbnail, accessType, published, order } = body;

  await db
    .update(courses)
    .set({
      title,
      description: description || null,
      thumbnail: thumbnail || null,
      accessType,
      published,
      order,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { courseId } = await params;
  await db.delete(courses).where(eq(courses.id, courseId));

  return NextResponse.json({ success: true });
}
