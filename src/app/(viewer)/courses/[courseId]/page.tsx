import { mockSession as session } from "@/lib/mock-session";
import { db } from "@/db";
import { courses, sections, videos, courseAccess } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  
  const user = session!.user;

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.published, true)),
  });

  if (!course) notFound();

  const isSubscriber = user.membershipType === "subscription";

  // アクセス権チェック
  const hasSubscriptionAccess = course.accessType === "subscription" && isSubscriber;
  const hasSingleAccess = course.accessType === "single" && (
    isSubscriber ||
    !!(await db.query.courseAccess.findFirst({
      where: and(
        eq(courseAccess.userId, user.id),
        eq(courseAccess.courseId, courseId)
      ),
    }))
  );

  if (!hasSubscriptionAccess && !hasSingleAccess) {
    if (course.accessType === "subscription" && !isSubscriber) {
      redirect("/");
    }
    redirect(`/courses/${courseId}/unlock`);
  }

  const courseSections = await db.query.sections.findMany({
    where: eq(sections.courseId, courseId),
    orderBy: [asc(sections.order)],
    with: {
      videos: {
        orderBy: [asc(videos.order)],
      },
    },
  });

  const firstVideo = courseSections[0]?.videos[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600 transition-colors">講座一覧</Link>
        <span>/</span>
        <span className="text-gray-700">{course.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <div className="section-divider w-12 mb-4" />
          {course.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
          )}

          {firstVideo && (
            <div className="card overflow-hidden mb-6">
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${firstVideo.youtubeId}`}
                  title={firstVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-4">
                <p className="font-medium text-gray-900">{firstVideo.title}</p>
              </div>
            </div>
          )}
        </div>

        {/* サイドバー：セクション一覧 */}
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">カリキュラム</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {courseSections.reduce((acc, s) => acc + s.videos.length, 0)} 動画
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {courseSections.map((section, sIdx) => (
                <div key={section.id}>
                  <div className="px-5 py-3 bg-indigo-50">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      第{sIdx + 1}章 {section.title}
                    </p>
                  </div>
                  {section.videos.map((video, vIdx) => (
                    <Link
                      key={video.id}
                      href={`/courses/${courseId}/watch?v=${video.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {vIdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1">{video.title}</p>
                        {video.duration && (
                          <p className="text-xs text-gray-400 mt-0.5">{video.duration}</p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
