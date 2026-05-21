"use client";

import { useRouter } from "next/navigation";

type Props = {
  courseId: string;
  courseTitle: string;
};

export default function DeleteCourseButton({ courseId, courseTitle }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`「${courseTitle}」を削除しますか？この操作は取り消せません。`)) return;

    const res = await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600 font-medium transition-colors"
    >
      削除
    </button>
  );
}
