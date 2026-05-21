import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/db";
import { subscriptionPasswords, users } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ passwordId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { passwordId } = await params;

  const pw = await db.query.subscriptionPasswords.findFirst({
    where: eq(subscriptionPasswords.id, passwordId),
  });

  if (!pw) {
    return NextResponse.json({ error: "パスワードが見つかりません" }, { status: 404 });
  }

  // 使用者のサブスク権限を剥奪してリセット
  if (pw.usedByEmail) {
    await db
      .update(users)
      .set({ membershipType: "none" })
      .where(eq(users.email, pw.usedByEmail));
  }

  await db
    .update(subscriptionPasswords)
    .set({ usedByEmail: null, usedAt: null })
    .where(eq(subscriptionPasswords.id, passwordId));

  return NextResponse.json({ success: true });
}
