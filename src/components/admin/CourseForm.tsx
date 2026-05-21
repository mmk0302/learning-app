"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  accessType: "single" | "subscription";
  published: boolean;
  order: number;
};

type Props = {
  course?: Course;
};

export default function CourseForm({ course }: Props) {
  const router = useRouter();
  const isEdit = !!course;

  const [formData, setFormData] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    thumbnail: course?.thumbnail ?? "",
    accessType: course?.accessType ?? "single",
    published: course?.published ?? false,
    order: course?.order ?? 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = isEdit ? `/api/admin/courses/${course.id}` : "/api/admin/courses";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/courses/${data.id ?? course?.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "エラーが発生しました");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          講座名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="form-input"
          required
          placeholder="例：UI/UXデザイン基礎講座"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">説明</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="form-input min-h-[100px] resize-y"
          placeholder="講座の説明を入力..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          サムネイルURL
        </label>
        <input
          type="url"
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          className="form-input"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          アクセスタイプ <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.accessType}
          onChange={(e) =>
            setFormData({ ...formData, accessType: e.target.value as "single" | "subscription" })
          }
          className="form-input"
        >
          <option value="single">単発購入</option>
          <option value="subscription">サブスク会員限定</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">表示順序</label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
          className="form-input"
          min={0}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
        </label>
        <span className="text-sm font-medium text-gray-700">公開する</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? "保存中..." : isEdit ? "更新する" : "作成する"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
