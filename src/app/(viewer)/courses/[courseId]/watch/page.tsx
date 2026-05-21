import { auth } from "@/lib/auth";
import { db } from "@/db";
import { courses, sections, videos, courseAccess } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ v?: string }>;
};

export default async function WatchPage({ params, searchParams }: Props) {
  const { courseId } = await params;
  const { v: videoId } = await searchParams;
  const session = await auth();
  const user = session!.user;

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.published, true)),
  });

  if (!course) notFound();

  const isSubscriber = user.membershipType === "subscription";
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

  // 現在の動画を特定
  type VideoRow = (typeof courseSections)[number]["videos"][number];
  let currentVideo: VideoRow | null = null;
  let currentSectionTitle = "";
  for (const section of courseSections) {
    const found = section.videos.find((v) => v.id === videoId);
    if (found) {
      currentVideo = found;
      currentSectionTitle = section.title;
      break;
    }
  }

  if (!currentVideo && courseSections[0]?.videos[0]) {
    currentVideo = courseSections[0].videos[0];
    currentSectionTitle = courseSections[0].title;
  }

  if (!currentVideo) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* パンくず */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600 transition-colors">講座一覧</Link>
        <span>/</span>
        <Link href={`/courses/${courseId}`} className="hover:text-gray-600 transition-colors line-clamp-1 max-w-[200px]">
          {course.title}
        </Link>
        <span>/</span>
        <span className="text-gray-700 line-clamp-1 max-w-[200px]">{currentVideo.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 動画プレーヤー */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>

          {/* 動画情報 */}
          <div className="card p-5">
            <p className="text-xs font-medium text-indigo-600 mb-1">{currentSectionTitle}</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{currentVideo.title}</h1>
            {currentVideo.duration && (
              <p className="text-sm text-gray-400">{currentVideo.duration}</p>
            )}
            {currentVideo.description && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{currentVideo.description}</p>
            )}
          </div>
        </div>

        {/* カリキュラムサイドバー */}
        <div className="lg:col-span-1">
          <div className="card p-0 overflow-hidden sticky top-20">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">カリキュラム</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-[calc(100vh-180px)] overflow-y-auto">
              {courseSections.map((section, sIdx) => (
                <div key={section.id}>
                  <div className="px-5 py-3 bg-indigo-50 sticky top-0">
                    <p className="text-xs font-bold text-indigo-700">
                      第{sIdx + 1}章 {section.title}
                    </p>
                  </div>
                  {section.videos.map((video, vIdx) => {
                    const isActive = video.id === currentVideo!.id;
                    return (
                      <Link
                        key={video.id}
                        href={`/courses/${courseId}/watch?v=${video.id}`}
                        className={`flex items-center gap-3 px-5 py-3.5 transition-colors group ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          isActive
                            ? "bg-white text-indigo-600"
                            : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                        }`}>
                          {isActive ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          ) : (
                            vIdx + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm line-clamp-1 ${isActive ? "font-medium" : ""}`}>
                            {video.title}
                          </p>
                          {video.duration && (
                            <p className={`text-xs mt-0.5 ${isActive ? "text-indigo-200" : "text-gray-400"}`}>
                              {video.duration}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
