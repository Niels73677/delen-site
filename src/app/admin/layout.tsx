import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s — Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate: anonymous users go to login, customers are sent home.
  const auth = await requireAdminPage();
  return (
    <div className="min-h-screen bg-surface/50">
      <AdminNav email={auth.email} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
