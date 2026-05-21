import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { coursePasswords } from "@/db/schema";
import { generateId } from "@/lib/id";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { courseId, password } = await req.json();

  if (!courseId || !password) {
    return NextResponse.json({ error: "パラメータが不足しています" }, { status: 400 });
  }

  const id = generateId();
  const now = new Date();
  await db.insert(coursePasswords).values({ id, courseId, password });

  return NextResponse.json({
    id,
    courseId,
    password,
    usedByEmail: null,
    usedAt: null,
    createdAt: now,
  });
}
