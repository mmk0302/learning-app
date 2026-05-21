import Link from "next/link";
import Image from "next/image";

type Course = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  accessType: "single" | "subscription";
};

type Props = {
  course: Course;
  hasAccess: boolean;
  isSubscriber: boolean;
};

export default function CourseCard({ course, hasAccess, isSubscriber }: Props) {
  const isSubscriptionOnly = course.accessType === "subscription";
  const isLocked = !hasAccess;

  return (
    <div className="card group">
      {/* サムネイル */}
      <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* バッジ */}
        <div className="absolute top-3 left-3">
          {isSubscriptionOnly ? (
            <span className="badge-subscription">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              サブスク会員限定
            </span>
          ) : (
            <span className="badge-single">単発購入</span>
          )}
        </div>

        {/* ロックオーバーレイ */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <div className="text-center text-white">
              <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-bold">
                {isSubscriptionOnly && !isSubscriber ? "サブスク会員限定" : "パスワードが必要"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
        )}

        {hasAccess ? (
          <Link
            href={`/courses/${course.id}`}
            className="btn-primary w-full text-sm py-2.5"
          >
            視聴する
          </Link>
        ) : isSubscriptionOnly && !isSubscriber ? (
          <div className="text-center">
            <p className="text-xs text-purple-600 font-medium mb-2">
              この講座はサブスク会員のみ閲覧可能です
            </p>
            <a
              href="https://note.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full text-sm py-2.5"
            >
              noteでサブスクに登録する
            </a>
          </div>
        ) : (
          <Link
            href={`/courses/${course.id}/unlock`}
            className="btn-secondary w-full text-sm py-2.5"
          >
            パスワードを入力して解放する
          </Link>
        )}
      </div>
    </div>
  );
}
