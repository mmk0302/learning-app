"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/courses/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push(`/courses/${courseId}`);
    } else {
      setError(data.error ?? "エラーが発生しました");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">講座を解放する</h1>
          <p className="text-gray-500 mt-2 text-sm">
            noteで購入したパスワードを入力してください
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="例: abc123xyz"
                className="form-input"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "確認中..." : "解放する"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
            <p className="text-xs text-indigo-700 leading-relaxed">
              パスワードはnoteの購入記事内に記載されています。
              <br />
              1つのパスワードは1つのメールアドレスにのみ紐付きます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
