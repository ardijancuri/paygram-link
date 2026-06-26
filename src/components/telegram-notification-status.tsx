"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

type StatusPayload = {
  connected?: boolean;
};

export function TelegramNotificationStatus({
  initialConnected,
  telegramLink,
}: {
  initialConnected: boolean;
  telegramLink: string | null;
}) {
  const router = useRouter();
  const [connected, setConnected] = useState(initialConnected);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setConnected(initialConnected);
  }, [initialConnected]);

  useEffect(() => {
    if (!checking || connected) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function checkStatus() {
      attempts += 1;

      try {
        const response = await fetch("/api/settings/telegram-notifications", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as StatusPayload;

        if (!cancelled && payload.connected) {
          setConnected(true);
          setChecking(false);
          router.refresh();
        }
      } catch {
        // Keep polling briefly; the webhook may still be finishing.
      }

      if (!cancelled && attempts >= 45) {
        setChecking(false);
      }
    }

    void checkStatus();
    const intervalId = window.setInterval(checkStatus, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [checking, connected, router]);

  useEffect(() => {
    if (connected) {
      return;
    }

    function refreshOnFocus() {
      if (!document.hidden) {
        setChecking(true);
      }
    }

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [connected]);

  if (connected) {
    return (
      <div className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
        <CheckCircle2 aria-hidden className="size-5" />
        Notifications connected
      </div>
    );
  }

  if (!telegramLink) {
    return (
      <p className="mt-5 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
        Set <span className="font-mono text-slate-950">TELEGRAM_BOT_USERNAME</span> to generate the bot link.
      </p>
    );
  }

  return (
    <div className="mt-5 flex flex-col items-start gap-3">
      <a
        className="btn-primary"
        href={telegramLink}
        onClick={() => setChecking(true)}
        rel="noreferrer"
        target="_blank"
      >
        Connect Telegram bot
      </a>

      {checking ? (
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 aria-hidden className="size-4 animate-spin text-sky-600" />
          Waiting for Telegram confirmation...
        </p>
      ) : null}
    </div>
  );
}
