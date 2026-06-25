import { ArrowRight, CircleDollarSign, Link2, WalletCards } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { getDashboardMetrics, getSellerWallet, listPaymentLinks } from "@/lib/repositories";
import { requireUser } from "@/lib/session";
import { formatNanoTon } from "@/lib/ton";

export default async function DashboardPage() {
  const user = await requireUser();
  const [metrics, wallet, links] = await Promise.all([
    getDashboardMetrics(user.id),
    getSellerWallet(user.id),
    listPaymentLinks(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-extrabold text-sky-600">Testnet workspace</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Seller dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Monitor payment links, detected TON volume, and your Telegram notification setup.
          </p>
        </div>
        <Link className="btn-primary" href="/dashboard/links">
          Create link
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white md:grid-cols-3">
        {[
          { label: "Created links", value: metrics.totalLinks.toString(), icon: Link2 },
          { label: "Paid links", value: metrics.paidLinks.toString(), icon: CircleDollarSign },
          { label: "Tracked volume", value: `${formatNanoTon(metrics.totalVolumeNano)} TON`, icon: WalletCards },
        ].map((item) => (
          <div
            className="border-b border-slate-100 p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            key={item.label}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-500">{item.label}</p>
              <item.icon aria-hidden className="size-5 text-sky-600" />
            </div>
            <p className="mt-4 text-3xl font-black text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>

      {!wallet ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-black text-amber-950">Add a receiving wallet</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Payment links use a snapshot of your TON testnet wallet, so add the wallet before creating links.
          </p>
          <Link className="mt-4 inline-flex text-sm font-black text-amber-950 underline" href="/dashboard/settings">
            Open settings
          </Link>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <h2 className="font-black text-slate-950">Recent links</h2>
          <Link className="text-sm font-black text-sky-700" href="/dashboard/links">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {links.slice(0, 5).map((link) => (
            <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between" key={link.id}>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-slate-950">{link.title}</p>
                  <StatusBadge status={link.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatNanoTon(link.amountNano)} TON / {link.paidAttempts} paid attempts
                </p>
              </div>
              <Link className="text-sm font-black text-sky-700" href={`/pay/${link.slug}`}>
                Open checkout
              </Link>
            </div>
          ))}

          {links.length === 0 ? <p className="px-5 py-8 text-sm text-slate-500">No payment links yet.</p> : null}
        </div>
      </div>
    </div>
  );
}

