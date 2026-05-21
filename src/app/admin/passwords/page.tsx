import { db } from "@/db";
import { coursePasswords, subscriptionPasswords, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import PasswordManager from "@/components/admin/PasswordManager";

export default async function PasswordsPage() {
  const allCourses = await db.query.courses.findMany({
    where: eq(courses.accessType, "single"),
    orderBy: (courses, { asc }) => [asc(courses.order)],
  });

  const allCoursePasswords = await db.query.coursePasswords.findMany({
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  const allSubPasswords = await db.query.subscriptionPasswords.findMany({
    orderBy: (p, { desc }) => [desc(p.createdAt)],
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
