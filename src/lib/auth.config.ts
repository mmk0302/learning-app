import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge対応の軽量設定（DBアダプターなし）
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "dummy",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const publicPaths = ["/login", "/api/auth"];
      const isPublic = publicPaths.some((p) => pathname.startsWith(p));

      if (!auth && !isPublic) return false;

      if (pathname.startsWith("/admin") && auth?.user?.role !== "admin") {
        return Response.redirect(new URL("/", request.url));
      }

      return true;
    },
  },
};
