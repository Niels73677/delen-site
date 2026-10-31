import Image from "next/image";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface lg:block">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex items-center justify-center px-4 py-16 sm:px-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
