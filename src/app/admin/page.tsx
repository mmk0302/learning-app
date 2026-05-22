export const dynamic = "force-dynamic";
import { db } from "@/db";
import { courses, users, courseAccess } from "@/db/schema";
import { count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const [courseCount] = await db.select({ count: count() }).from(courses);
  const [userCount] = await db.select({ count: count() }).from(users);
  const [accessCount] = await db.select({ count: count() }).from(courseAccess);

  const stats = [
    { label: "総講座数", value: courseCount.count, href: "/admin/courses" },
    { label: "登録ユーザー数", value: userCount.count, href: "#" },
    { label: "総アクセス権付与数", value: accessCount.count, href: "/admin/passwords" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-6 block">
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="flex gap-4">
        <Link href="/admin/courses/new" className="btn-primary">
          + 新しい講座を作成
        </Link>
        <Link href="/admin/passwords" className="btn-secondary">
          パスワード管理
        </Link>
      </div>
    </div>
  );
}
