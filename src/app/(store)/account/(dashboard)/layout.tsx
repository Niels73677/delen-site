import { requireUserPage } from "@/lib/auth/session";
import { AccountNav } from "@/components/account/account-nav";
import { SignOutButton } from "@/components/account/sign-out-button";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireUserPage("/account");
  const name = auth.profile?.full_name?.split(" ")[0];
  return (
    <div className="container-page pb-24 pt-10 lg:pt-16">
      <header className="mb-10 lg:mb-14">
        <p className="eyebrow text-muted-foreground">Your account</p>
        <h1 className="text-headline mt-4 font-semibold uppercase">{name ? `Hello, ${name}.` : "Hello."}</h1>
      </header>
      <div className="grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <AccountNav isAdmin={auth.profile?.role === "admin"} />
          <SignOutButton className="mt-8 hidden lg:flex" />
        </aside>
        <div className="min-w-0 lg:col-span-9">
          {children}
          <SignOutButton className="mt-16 lg:hidden" />
        </div>
      </div>
    </div>
  );
}
