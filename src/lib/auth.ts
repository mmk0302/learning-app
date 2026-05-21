import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/id";
import { authConfig } from "@/lib/auth.config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = DrizzleAdapter(db, {
  usersTable: users as any,
  accountsTable: accounts as any,
  sessionsTable: sessions as any,
  verificationTokensTable: verificationTokens as any,
});

const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "dummy",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "dummy",
  }),
];

if (process.env.NODE_ENV === "development") {
  providers.push(
    Credentials({
      name: "テストログイン",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        role: { label: "ロール", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;
        const role = (credentials.role as string) === "admin" ? "admin" : "member";

        let user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) {
          const id = generateId();
          await db.insert(users).values({ id, email, name: email.split("@")[0], role });
          user = await db.query.users.findFirst({ where: eq(users.id, id) });
        }
        return { id: user!.id, email: user!.email, name: user!.name };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });
        token.role = dbUser?.role ?? "member";
        token.membershipType = dbUser?.membershipType ?? "none";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "admin" | "member") ?? "member";
        session.user.membershipType = (token.membershipType as "none" | "single" | "subscription") ?? "none";
      }
      return session;
    },
  },
});
