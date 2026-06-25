"use client";

import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { CheckCircle2, Clock3, Copy, Send, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CheckoutLink = {
  id: string;
  title: string;
  description: string | null;
  amountNano: string;
  amountTon: string;
  recipientWallet: string;
  successMessage: string | null;
};

type AttemptPayload = {
  attempt: {
    id: string;
    status: "created" | "submitted" | "pending" | "paid" | "failed" | "expired" | "manual_review";
    memo: string;
  };
  transaction: Parameters<ReturnType<typeof useTonConnectUI>[0]["sendTransaction"]>[0];
};

export function CheckoutClient({ link }: { link: CheckoutLink }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [status, setStatus] = useState<AttemptPayload["attempt"]["status"]>("created");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!attemptId || !["pending", "submitted"].includes(status)) {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/payment-attempts?id=${attemptId}`, { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { attempt: AttemptPayload["attempt"] };
      setStatus(payload.attempt.status);
    }, 4_000);

    return () => window.clearInterval(interval);
  }, [attemptId, status]);

  async function beginPayment() {
    if (!wallet) {
      await tonConnectUI.openModal();
      return;
    }

    setLoading(true);
    setError(null);

    let activeAttemptId: string | null = null;

    try {
      const response = await fetch("/api/payment-attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          paymentLinkId: link.id,
          buyerWallet: wallet.account.address,
        }),
      });

      const payload = (await response.json()) as AttemptPayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not prepare the payment.");
      }

      setAttemptId(payload.attempt.id);
      activeAttemptId = payload.attempt.id;
      await tonConnectUI.sendTransaction(payload.transaction);

      await fetch("/api/payment-attempts", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: payload.attempt.id,
          status: "pending",
          buyerWallet: wallet.account.address,
        }),
      });

      setStatus("pending");
    } catch (paymentError) {
      if (activeAttemptId ?? attemptId) {
        await fetch("/api/payment-attempts", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: activeAttemptId ?? attemptId, status: "failed", buyerWallet: wallet?.account.address }),
        });
      }

      setStatus("failed");
      setError(paymentError instanceof Error ? paymentError.message : "Payment failed.");
    } finally {
      setLoading(false);
    }
  }

  const paid = status === "paid";
  const failed = ["failed", "expired", "manual_review"].includes(status);

  return (
    <div className="min-h-svh bg-[#f6f8fb] text-slate-950">
      <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-5 py-8 sm:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link className="inline-flex items-center gap-3 text-lg font-black" href="/">
            <span className="grid size-9 place-items-center rounded-lg bg-slate-950 text-sm text-white">P</span>
            PayGram Link
          </Link>
          <TonConnectButton />
        </div>

        <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-[1fr_420px]">
          <div className="min-h-[520px] bg-slate-950 p-6 text-white sm:p-10">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="mb-4 text-sm font-black text-sky-300">TON testnet checkout</p>
                <h1 className="max-w-2xl text-4xl font-black leading-[1.05] text-white sm:text-6xl">{link.title}</h1>
                {link.description ? <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{link.description}</p> : null}
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-3">
                {[
                  ["Network", "Testnet"],
                  ["Custody", "Direct"],
                  ["Status", paid ? "Paid" : status],
                ].map(([label, value]) => (
                  <div className="border-t border-white/12 pt-4" key={label}>
                    <p className="text-xs font-bold text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-black capitalize text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="border-b border-slate-100 pb-5">
              <p className="text-sm font-bold text-slate-500">Amount due</p>
              <p className="mt-2 text-5xl font-black">{link.amountTon} TON</p>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="flex items-center justify-between gap-2 font-bold text-slate-500">
                  Recipient
                  <Copy aria-hidden className="size-4 text-slate-400" />
                </dt>
                <dd className="mt-2 break-all font-mono text-xs leading-5 text-slate-950">{link.recipientWallet}</dd>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-sky-50 p-4 text-sky-800">
                <ShieldCheck aria-hidden className="size-5" />
                <div>
                  <dt className="font-bold">Network</dt>
                  <dd className="text-sm font-semibold">TON testnet</dd>
                </div>
              </div>
            </dl>

            <button
              className="btn-primary mt-6 w-full"
              disabled={loading || paid}
              onClick={beginPayment}
              type="button"
            >
              <Send aria-hidden className="size-4" />
              {!wallet ? "Connect wallet" : loading ? "Opening wallet..." : paid ? "Payment received" : "Pay with TON"}
            </button>

            <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">
              {paid ? (
                <div className="flex gap-3 text-emerald-700">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm font-medium">{link.successMessage || "Payment received. Thank you."}</p>
                </div>
              ) : failed ? (
                <div className="flex gap-3 text-red-700">
                  <XCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm font-medium">{error ?? `Payment status: ${status}`}</p>
                </div>
              ) : (
                <div className="flex gap-3 text-slate-600">
                  <Clock3 aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm">
                    {status === "pending"
                      ? "Payment submitted. Waiting for PayGram Link to detect the transfer."
                      : "Connect a wallet, confirm the transaction, then keep this page open for status updates."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
