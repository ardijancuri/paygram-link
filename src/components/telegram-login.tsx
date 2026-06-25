"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

declare global {
  interface Window {
    PayGramTelegramAuth?: (user: unknown) => void;
  }
}

export function TelegramLogin({
  botUsername,
  devAuthEnabled,
}: {
  botUsername?: string;
  devAuthEnabled: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!botUsername || !containerRef.current) {
      return;
    }

    window.PayGramTelegramAuth = async (user: unknown) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(user),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Telegram login failed.");
        }

        router.push("/dashboard");
        router.refresh();
      } catch (loginError) {
        setError(loginError instanceof Error ? loginError.message : "Telegram login failed.");
      } finally {
        setLoading(false);
      }
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "PayGramTelegramAuth(user)");

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);

    return () => {
      delete window.PayGramTelegramAuth;
      script.remove();
    };
  }, [botUsername, router]);

  async function continueAsDevSeller() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/dev", { method: "POST" });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Development login failed.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Development login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {botUsername ? (
        <div className="telegram-login-button" title="Log in with Telegram">
          <span className="telegram-login-face" aria-hidden>
            <Send className="size-5 fill-current stroke-[2.5]" />
            <span>{loading ? "Signing in..." : "Log in with Telegram"}</span>
          </span>
          <div className="telegram-login-widget" ref={containerRef} />
        </div>
      ) : devAuthEnabled ? null : (
        <div className="rounded-md border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
          Set <span className="font-mono text-slate-900">NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</span> to enable Telegram login.
        </div>
      )}

      {devAuthEnabled ? (
        <button
          className="btn-primary"
          disabled={loading}
          onClick={continueAsDevSeller}
          type="button"
        >
          {loading ? "Signing in..." : "Continue as test seller"}
        </button>
      ) : null}

      {!botUsername && devAuthEnabled ? (
        <p className="max-w-xs text-xs leading-5 text-slate-500">
          Telegram login is waiting for <span className="font-mono text-slate-700">NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</span>.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
