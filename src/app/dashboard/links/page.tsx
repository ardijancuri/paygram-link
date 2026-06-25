import { ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";

import { PaymentLinkForm } from "@/components/payment-link-form";
import { StatusBadge } from "@/components/status-badge";
import { getSellerWallet, listPaymentLinks } from "@/lib/repositories";
import { requireUser } from "@/lib/session";
import { formatNanoTon } from "@/lib/ton";

export default async function LinksPage() {
  const user = await requireUser();
  const [wallet, links] = await Promise.all([getSellerWallet(user.id), listPaymentLinks(user.id)]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-extrabold text-sky-600">Payment links</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Create and manage links</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create checkout URLs with a wallet snapshot, fixed TON amount, and payment status tracking.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">
          {links.length} total links
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="paygram-panel-strong rounded-lg p-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Link2 aria-hidden className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-950">New link</h2>
              <p className="text-sm text-slate-500">Ready to share after creation.</p>
            </div>
          </div>
          <div className="mt-5">
            <PaymentLinkForm walletReady={Boolean(wallet)} />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-black text-slate-950">All links</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {links.map((link) => {
              const checkoutUrl = `${appUrl}/pay/${link.slug}`;

              return (
                <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]" key={link.id}>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-slate-950">{link.title}</h3>
                      <StatusBadge status={link.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatNanoTon(link.amountNano)} TON / {link.paidAttempts}/{link.totalAttempts} paid attempts
                    </p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-500">{checkoutUrl}</p>
                  </div>
                  <Link className="btn-secondary" href={`/pay/${link.slug}`}>
                    Open
                    <ExternalLink aria-hidden className="size-4" />
                  </Link>
                </div>
              );
            })}

            {links.length === 0 ? (
              <p className="px-5 py-10 text-sm text-slate-500">Create your first checkout link.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

