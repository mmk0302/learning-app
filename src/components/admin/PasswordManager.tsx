"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = { id: string; title: string };
type CoursePassword = {
  id: string;
  courseId: string;
  password: string;
  usedByEmail: string | null;
  usedAt: Date | null;
  createdAt: Date;
};
type SubPassword = {
  id: string;
  password: string;
  usedByEmail: string | null;
  usedAt: Date | null;
  createdAt: Date;
};

type Props = {
  courses: Course[];
  coursePasswords: CoursePassword[];
  subscriptionPasswords: SubPassword[];
};

export default function PasswordManager({
  courses,
  coursePasswords: initialCPW,
  subscriptionPasswords: initialSPW,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"single" | "subscription">("single");
  const [cpw, setCpw] = useState(initialCPW);
  const [spw, setSpw] = useState(initialSPW);

  const [newCourseId, setNewCourseId] = useState(courses[0]?.id ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [newSubPassword, setNewSubPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function generatePassword() {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  async function addCoursePassword() {
    if (!newCourseId || !newPassword.trim()) return;
    setLoading(true);
    const res = await fetch("/api/admin/passwords/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: newCourseId, password: newPassword }),
    });
    if (res.ok) {
      const data = await res.json();
      setCpw([data, ...cpw]);
      setNewPassword("");
    }
    setLoading(false);
  }

  async function addSubPassword() {
    if (!newSubPassword.trim()) return;
    setLoading(true);
    const res = await fetch("/api/admin/passwords/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newSubPassword }),
    });
    if (res.ok) {
      const data = await res.json();
      setSpw([data, ...spw]);
      setNewSubPassword("");
    }
    setLoading(false);
  }

  async function resetCoursePassword(id: string) {
    if (!confirm("このパスワードの使用者をリセットしますか？")) return;
    const res = await fetch(`/api/admin/passwords/course/${id}/reset`, { method: "POST" });
    if (res.ok) {
      setCpw(cpw.map((p) => p.id === id ? { ...p, usedByEmail: null, usedAt: null } : p));
    }
  }

  async function resetSubPassword(id: string) {
    if (!confirm("このパスワードの使用者をリセットしますか？")) return;
    const res = await fetch(`/api/admin/passwords/subscription/${id}/reset`, { method: "POST" });
    if (res.ok) {
      setSpw(spw.map((p) => p.id === id ? { ...p, usedByEmail: null, usedAt: null } : p));
    }
  }

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.title]));

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-2 mb-6">
        {(["single", "subscription"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t === "single" ? "単発講座パスワード" : "サブスクパスワード"}
          </button>
        ))}
      </div>

      {tab === "single" && (
        <div className="space-y-5">
          {/* 追加フォーム */}
          <div className="card p-5 space-y-4">
            <h3 className="font-medium text-gray-900 text-sm">新しいパスワードを発行</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newCourseId}
                onChange={(e) => setNewCourseId(e.target.value)}
                className="form-input"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <div className="flex gap-2 sm:col-span-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="パスワード"
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setNewPassword(generatePassword())}
                  className="btn-secondary text-sm py-2 px-3 whitespace-nowrap"
                >
                  自動生成
                </button>
                <button
                  onClick={addCoursePassword}
                  disabled={loading || !newPassword.trim()}
                  className="btn-primary text-sm py-2 px-4 disabled:opacity-50 whitespace-nowrap"
                >
                  発行
                </button>
              </div>
            </div>
          </div>

          {/* 一覧 */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">講座</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">パスワード</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">使用者</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cpw.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-700 text-xs max-w-[140px] truncate">
                      {courseMap[p.courseId] ?? p.courseId}
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{p.password}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.usedByEmail ? (
                        <span className="text-xs text-gray-600">{p.usedByEmail}</span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">未使用</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.usedByEmail && (
                        <button
                          onClick={() => resetCoursePassword(p.id)}
                          className="text-xs text-amber-500 hover:text-amber-700 font-medium transition-colors"
                        >
                          リセット
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {cpw.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">
                      パスワードがまだありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "subscription" && (
        <div className="space-y-5">
          {/* 追加フォーム */}
          <div className="card p-5 space-y-4">
            <h3 className="font-medium text-gray-900 text-sm">新しいサブスクパスワードを発行</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubPassword}
                onChange={(e) => setNewSubPassword(e.target.value)}
                placeholder="パスワード"
                className="form-input flex-1"
              />
              <button
                type="button"
                onClick={() => setNewSubPassword(generatePassword())}
                className="btn-secondary text-sm py-2 px-3 whitespace-nowrap"
              >
                自動生成
              </button>
              <button
                onClick={addSubPassword}
                disabled={loading || !newSubPassword.trim()}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-50 whitespace-nowrap"
              >
                発行
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">パスワード</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">使用者</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {spw.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{p.password}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.usedByEmail ? (
                        <span className="text-xs text-gray-600">{p.usedByEmail}</span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">未使用</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.usedByEmail && (
                        <button
                          onClick={() => resetSubPassword(p.id)}
                          className="text-xs text-amber-500 hover:text-amber-700 font-medium transition-colors"
                        >
                          リセット
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {spw.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">
                      パスワードがまだありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
