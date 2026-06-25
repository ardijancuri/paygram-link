"use client";

import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WalletSettingsForm({ currentAddress }: { currentAddress?: string | null }) {
  const router = useRouter();
  const [tonAddress, setTonAddress] = useState(currentAddress ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings/wallet", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tonAddress }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save wallet.");
      }

      setMessage("Receiving wallet saved.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save wallet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block">
        <span className="text-sm font-bold text-slate-800">TON testnet receiving wallet</span>
        <input
          className="field-control mt-2 font-mono text-sm"
          onChange={(event) => setTonAddress(event.target.value)}
          placeholder="kQ..."
          value={tonAddress}
        />
      </label>

      <button
        className="btn-primary"
        disabled={loading}
        type="submit"
      >
        <Wallet aria-hidden className="size-4" />
        {loading ? "Saving..." : "Save wallet"}
      </button>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
