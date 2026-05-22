export const dynamic = "force-dynamic";
import { db } from "@/db";
import { coursePasswords, subscriptionPasswords, courses } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import PasswordManager from "@/components/admin/PasswordManager";

export default async function PasswordsPage() {
  const allCourses = await db.query.courses.findMany({
    where: eq(courses.accessType, "single"),
    orderBy: [asc(courses.order)],
  });

  const allCoursePasswords = await db.query.coursePasswords.findMany({
    orderBy: [desc(coursePasswords.createdAt)],
  });

  const allSubPasswords = await db.query.subscriptionPasswords.findMany({
    orderBy: [desc(subscriptionPasswords.createdAt)],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">パスワード管理</h1>
      <PasswordManager
        courses={allCourses}
        coursePasswords={allCoursePasswords}
        subscriptionPasswords={allSubPasswords}
      />
    </div>
  );
}
