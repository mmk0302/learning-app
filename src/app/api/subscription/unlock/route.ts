import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptionPasswords, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "パスワードを入力してください" }, { status: 400 });
  }

  const userEmail = session.user.email;
  const userId = session.user.id;

  const pw = await db.query.subscriptionPasswords.findFirst({
    where: eq(subscriptionPasswords.password, password),
  });

  if (!pw) {
    return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 400 });
  }

  if (pw.usedByEmail === userEmail) {
    // 既に自分で使用済み → そのままサブスク権限を付与（冪等）
    await db
      .update(users)
      .set({ membershipType: "subscription" })
      .where(eq(users.id, userId));
    return NextResponse.json({ success: true });
  }

  if (pw.usedByEmail && pw.usedByEmail !== userEmail) {
    return NextResponse.json(
      { error: "このパスワードは既に別のアカウントで使用されています" },
      { status: 400 }
    );
  }

  // 未使用 → 紐付けてサブスク権限付与
  await db
    .update(subscriptionPasswords)
    .set({ usedByEmail: userEmail, usedAt: new Date() })
    .where(eq(subscriptionPasswords.id, pw.id));

  await db
    .update(users)
    .set({ membershipType: "subscription" })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
