import { clsx } from "clsx";

const toneByStatus: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-sky-50 text-sky-700 ring-sky-200",
  submitted: "bg-sky-50 text-sky-700 ring-sky-200",
  created: "bg-slate-50 text-slate-700 ring-slate-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  expired: "bg-amber-50 text-amber-700 ring-amber-200",
  archived: "bg-slate-100 text-slate-500 ring-slate-200",
  manual_review: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center rounded-md px-2.5 text-xs font-semibold capitalize ring-1",
        toneByStatus[status] ?? toneByStatus.created,
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
