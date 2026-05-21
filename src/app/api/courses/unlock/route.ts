import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { coursePasswords, courseAccess, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/id";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { courseId, password } = await req.json();

  if (!courseId || !password) {
    return NextResponse.json({ error: "パラメータが不足しています" }, { status: 400 });
  }

  // 講座の存在確認
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return NextResponse.json({ error: "講座が見つかりません" }, { status: 404 });
  }

  const userEmail = session.user.email;
  const userId = session.user.id;

  // パスワードの検索
  const pw = await db.query.coursePasswords.findFirst({
    where: and(
      eq(coursePasswords.courseId, courseId),
      eq(coursePasswords.password, password)
    ),
  });

  if (!pw) {
    return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 400 });
  }

  // 既に自分のメールで使用済みの場合はそのまま解放
  if (pw.usedByEmail === userEmail) {
    // アクセス権が既にあるか確認
    const existingAccess = await db.query.courseAccess.findFirst({
      where: and(
        eq(courseAccess.userId, userId),
        eq(courseAccess.courseId, courseId)
      ),
    });

    if (!existingAccess) {
      await db.insert(courseAccess).values({
        id: generateId(),
        userId,
        courseId,
      });
    }

    return NextResponse.json({ success: true });
  }

  // 他のメールアドレスが使用済みの場合はエラー
  if (pw.usedByEmail && pw.usedByEmail !== userEmail) {
    return NextResponse.json(
      { error: "このパスワードは既に別のアカウントで使用されています" },
      { status: 400 }
    );
  }

  // 未使用 → メールを紐付けてアクセス権を付与
  await db
    .update(coursePasswords)
    .set({
      usedByEmail: userEmail,
      usedAt: new Date(),
    })
    .where(eq(coursePasswords.id, pw.id));

  await db.insert(courseAccess).values({
    id: generateId(),
    userId,
    courseId,
  });

  return NextResponse.json({ success: true });
}
