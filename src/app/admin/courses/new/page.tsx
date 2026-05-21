import CourseForm from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新しい講座を作成</h1>
      <CourseForm />
    </div>
  );
}
