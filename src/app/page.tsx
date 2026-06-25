import { ArrowRight, Link2, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { TelegramLogin } from "@/components/telegram-login";

export default async function Home() {
  await connection();

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? process.env.TELEGRAM_BOT_USERNAME;
  const devAuthEnabled =
    process.env.NODE_ENV !== "production" &&
    (process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true" || process.env.ENABLE_DEV_LOGIN !== "false");

  return (
    <main className="min-h-svh bg-white">
      <section className="bg-white">
        <div className="mx-auto grid min-h-[82svh] max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.92fr_0.8fr] lg:items-center">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-lg font-black text-sky-600">PayGram Link</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.06] text-slate-950 sm:text-6xl">
              Simple TON payment links for Telegram.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Create a link, share it with buyers, and track testnet payments to your own wallet.
            </p>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-start">
              <TelegramLogin botUsername={botUsername} devAuthEnabled={devAuthEnabled} />
              <Link
                className="inline-flex h-11 items-center gap-2 text-sm font-black text-slate-700 transition hover:text-sky-700"
                href="/dashboard/links"
              >
                Create a test link
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>

          <div className="animate-fade-up rounded-lg border border-slate-200 bg-slate-50 p-6 [animation-delay:120ms]">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">Checkout</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Coffee support</h2>
                </div>
                <span className="text-sm font-black text-sky-700">TON</span>
              </div>

              <div className="py-8">
                <p className="text-sm font-bold text-slate-500">Amount</p>
                <p className="mt-2 text-5xl font-black text-slate-950">2 TON</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Buyer connects a wallet and confirms the testnet transaction.
                </p>
              </div>

              <div className="divide-y divide-slate-200/80">
                <div className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0">
                  <span className="font-bold text-slate-500">Status</span>
                  <span className="font-black text-sky-700">Pending</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="font-bold text-slate-500">Recipient</span>
                  <span className="font-mono text-xs text-slate-700">kQBF...x8F2</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3 text-sm last:pb-0">
                  <span className="font-bold text-slate-500">Notification</span>
                  <span className="font-black text-slate-700">Telegram</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div aria-hidden className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="border-t border-slate-200" />
      </div>

      <section className="mx-auto grid max-w-7xl gap-0 divide-y divide-slate-200 px-5 py-14 sm:px-8 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {[
          {
            icon: Link2,
            title: "Shareable checkout links",
            body: "Create payment links for tips, invoices, donations, tickets, or Telegram community support.",
          },
          {
            icon: WalletCards,
            title: "Direct wallet payments",
            body: "Buyers send TON directly to the seller wallet. PayGram only helps request and detect payment.",
          },
          {
            icon: ShieldCheck,
            title: "Testnet-first safety",
            body: "The MVP is wired for testnet flows before live-money mainnet and USDT support are added.",
          },
        ].map((item) => (
          <article className="px-0 py-8 first:pt-0 last:pb-0 sm:px-6 lg:py-2" key={item.title}>
            <item.icon aria-hidden className="size-9 text-sky-600" />
            <h2 className="mt-5 text-lg font-black text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </section>

      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center justify-center border-t border-slate-200 py-6 text-center text-sm font-semibold text-slate-500">
            <p>
              Powered by{" "}
              <a className="font-black text-sky-600 transition hover:text-sky-700" href="https://oninova.net">
                Oninova
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
