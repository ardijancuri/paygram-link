"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-60"
      disabled={loading}
      onClick={logout}
      type="button"
      title="Sign out"
    >
      <LogOut aria-hidden className="size-4" />
      Sign out
    </button>
  );
}
