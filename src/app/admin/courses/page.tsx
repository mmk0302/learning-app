export const dynamic = "force-dynamic";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
import DeleteCourseButton from "@/components/admin/DeleteCourseButton";

export default async function AdminCoursesPage() {
  const allCourses = await db.query.courses.findMany({
    orderBy: [asc(courses.order)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">講座管理</h1>
        <Link href="/admin/courses/new" className="btn-primary text-sm py-2.5 px-5">
          + 新しい講座
        </Link>
      </div>

      {allCourses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400 mb-4">まだ講座がありません</p>
          <Link href="/admin/courses/new" className="btn-primary">
            最初の講座を作成する
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">講座名</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">タイプ</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">公開状態</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">順序</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{course.title}</td>
                  <td className="px-5 py-4">
                    {course.accessType === "subscription" ? (
                      <span className="badge-subscription">サブスク限定</span>
                    ) : (
                      <span className="badge-single">単発購入</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      course.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${course.published ? "bg-green-500" : "bg-gray-400"}`} />
                      {course.published ? "公開中" : "非公開"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{course.order}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        編集
                      </Link>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
