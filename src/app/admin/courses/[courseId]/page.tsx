import { db } from "@/db";
import { courses, sections, videos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import CourseForm from "@/components/admin/CourseForm";
import SectionManager from "@/components/admin/SectionManager";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) notFound();

  const courseSections = await db.query.sections.findMany({
    where: eq(sections.courseId, courseId),
    orderBy: [asc(sections.order)],
    with: {
      videos: {
        orderBy: [asc(videos.order)],
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">講座を編集</h1>
        <p className="text-sm text-gray-400">{course.title}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <h2 className="text-base font-bold text-gray-700 mb-4">基本情報</h2>
          <CourseForm course={course} />
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-700 mb-4">セクション・動画</h2>
          <SectionManager courseId={courseId} sections={courseSections} />
        </div>
      </div>
    </div>
  );
}
