import { mockSession as session } from "@/lib/mock-session";
import { db } from "@/db";
import { courses, courseAccess } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import CourseCard from "@/components/viewer/CourseCard";

export default async function HomePage() {
  
  const user = session!.user;

  const allCourses = await db.query.courses.findMany({
    where: eq(courses.published, true),
    orderBy: [asc(courses.order)],
  });

  // ユーザーがアクセス権を持つ講座IDを取得
  const accessList = await db.query.courseAccess.findMany({
    where: eq(courseAccess.userId, user.id),
  });
  const accessibleCourseIds = new Set(accessList.map((a) => a.courseId));

  const isSubscriber = user.membershipType === "subscription";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* ヒーロー */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">講座一覧</h1>
        <div className="section-divider w-16 mb-4" />
        <p className="text-gray-500">
          {isSubscriber
            ? "すべての講座を閲覧できます。"
            : "購入した講座のパスワードを入力して視聴を開始しましょう。"}
        </p>
      </div>

      {allCourses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">現在公開中の講座はありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => {
            const hasAccess =
              (course.accessType === "subscription" && isSubscriber) ||
              (course.accessType === "single" && accessibleCourseIds.has(course.id)) ||
              (course.accessType === "single" && isSubscriber);

            return (
              <CourseCard
                key={course.id}
                course={course}
                hasAccess={hasAccess}
                isSubscriber={isSubscriber}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
