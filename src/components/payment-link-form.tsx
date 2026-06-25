"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PaymentLinkForm({ walletReady }: { walletReady: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("1");
  const [successMessage, setSuccessMessage] = useState("Thanks for supporting my work.");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, amount, successMessage }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not create payment link.");
      }

      setTitle("");
      setDescription("");
      setAmount("1");
      setSuccessMessage("Thanks for supporting my work.");
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create payment link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-[1fr_160px]">
        <label className="block">
          <span className="text-sm font-bold text-slate-800">Title</span>
          <input
            className="field-control mt-2 text-sm"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Coffee support"
            value={title}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-800">Amount</span>
          <input
            className="field-control mt-2 text-sm"
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="2"
            value={amount}
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-slate-800">Description</span>
        <textarea
          className="field-control field-area mt-2 text-sm"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Support my Telegram channel with a small TON payment."
          value={description}
        />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-800">Success message</span>
        <input
          className="field-control mt-2 text-sm"
          onChange={(event) => setSuccessMessage(event.target.value)}
          value={successMessage}
        />
      </label>

      <button
        className="btn-primary"
        disabled={loading || !walletReady}
        type="submit"
      >
        <Plus aria-hidden className="size-4" />
        {loading ? "Creating..." : "Create link"}
      </button>

      {!walletReady ? <p className="text-sm text-amber-700">Add a receiving wallet before creating links.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
