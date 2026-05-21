import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { sections } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ sectionId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { sectionId } = await params;
  await db.delete(sections).where(eq(sections.id, sectionId));

  return NextResponse.json({ success: true });
}
