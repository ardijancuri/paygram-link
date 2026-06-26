"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

declare global {
  interface Window {
    Telegram?: {
      Login?: {
        auth?: (
          options: { bot_id: string; request_access?: "write" },
          callback: (user: unknown) => void,
        ) => void;
      };
    };
  }
}

export function TelegramLogin({
  botId,
  botUsername,
  devAuthEnabled,
}: {
  botId?: string;
  botUsername?: string;
  devAuthEnabled: boolean;
}) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [telegramReady, setTelegramReady] = useState(false);

  useEffect(() => {
    if (!botId) {
      return;
    }

    if (window.Telegram?.Login?.auth) {
      setTelegramReady(true);
      return;
    }

    const existingScript = document.getElementById("telegram-login-script") as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    script.async = true;
    script.id = "telegram-login-script";
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.onload = () => setTelegramReady(true);

    if (!existingScript) {
      document.body.appendChild(script);
    }

    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        scriptRef.current.onload = null;
      }
    };
  }, [botId]);

  async function finishTelegramLogin(user: unknown) {
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
  }

  function openTelegramLogin() {
    setError(null);

    if (!botId || !window.Telegram?.Login?.auth) {
      setError("Telegram login is still loading. Try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      window.Telegram.Login.auth({ bot_id: botId, request_access: "write" }, (user) => {
        if (!user) {
          setLoading(false);
          setError("Telegram login was cancelled.");
          return;
        }

        void finishTelegramLogin(user);
      });
    } catch (loginError) {
      setLoading(false);
      setError(loginError instanceof Error ? loginError.message : "Telegram login failed.");
    }
  }

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
      {botUsername && botId ? (
        <button
          className="telegram-login-button"
          disabled={loading || !telegramReady}
          onClick={openTelegramLogin}
          type="button"
        >
          <Send aria-hidden className="size-5 fill-current stroke-[2.5]" />
          <span>{loading ? "Signing in..." : "Log in with Telegram"}</span>
        </button>
      ) : devAuthEnabled ? null : (
        <div className="rounded-md border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
          Set <span className="font-mono text-slate-900">NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</span> and{" "}
          <span className="font-mono text-slate-900">TELEGRAM_BOT_TOKEN</span> to enable Telegram login.
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
