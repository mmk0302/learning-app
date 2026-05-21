"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
    membershipType: "none" | "single" | "subscription";
  };
};

const membershipLabel = {
  none: null,
  single: { label: "単発会員", className: "badge-single" },
  subscription: { label: "サブスク会員", className: "badge-subscription" },
};

export default function Header({ user }: Props) {
  const membership = membershipLabel[user.membershipType];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">動画講座</span>
        </Link>

        <div className="flex items-center gap-3">
          {membership && (
            <span className={membership.className}>{membership.label}</span>
          )}
          <div className="flex items-center gap-2">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? ""}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {user.name?.[0] ?? user.email[0]}
              </div>
            )}
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.name ?? user.email}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
