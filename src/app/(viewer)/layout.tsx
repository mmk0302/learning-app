import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/viewer/Header";

export default async function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={session.user} />
      <main className="flex-1">{children}</main>
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-100">
        © 2026 動画講座プラットフォーム
      </footer>
    </div>
  );
}
