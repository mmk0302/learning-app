// 認証一時無効化（UI確認用）
// 本番実装時は元の NextAuth + DrizzleAdapter 構成に戻す
import { mockSession } from "@/lib/mock-session";
import type { NextRequest } from "next/server";

export const auth = async (_req?: NextRequest) => mockSession;

export const handlers = {
  GET: async () => new Response("Auth disabled", { status: 200 }),
  POST: async () => new Response("Auth disabled", { status: 200 }),
};

export const signIn = async () => {};
export const signOut = async () => {};
