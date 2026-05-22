import { mockSession as session } from "@/lib/mock-session";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
