import { LayoutDashboard, Link2, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/session";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-svh bg-[#f6f8fb]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link className="inline-flex items-center gap-3 text-lg font-black text-slate-950" href="/dashboard">
            <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-sm text-white">P</span>
            <span>PayGram Link</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 sm:inline">
              {user.displayName}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[236px_1fr]">
        <aside>
          <nav className="paygram-panel flex gap-2 overflow-x-auto rounded-lg p-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => (
              <Link
                className="inline-flex h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-extrabold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
                href={item.href}
                key={item.href}
              >
                <item.icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}

