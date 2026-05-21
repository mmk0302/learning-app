import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { coursePasswords, courseAccess } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ passwordId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { passwordId } = await params;

  const pw = await db.query.coursePasswords.findFirst({
    where: eq(coursePasswords.id, passwordId),
  });

  if (!pw) {
    return NextResponse.json({ error: "パスワードが見つかりません" }, { status: 404 });
  }

  // 使用者のアクセス権を削除（メールからユーザーを特定するのは複雑なため、リセットのみ）
  await db
    .update(coursePasswords)
    .set({ usedByEmail: null, usedAt: null })
    .where(eq(coursePasswords.id, passwordId));

  return NextResponse.json({ success: true });
}
