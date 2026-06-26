import { Bell, WalletCards } from "lucide-react";

import { TelegramNotificationStatus } from "@/components/telegram-notification-status";
import { WalletSettingsForm } from "@/components/wallet-settings-form";
import { getSellerWallet } from "@/lib/repositories";
import { requireUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireUser();
  const wallet = await getSellerWallet(user.id);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const telegramLink = botUsername ? `https://t.me/${botUsername}?start=${user.notificationLinkToken}` : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-extrabold text-sky-600">Seller setup</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Configure where funds land and how PayGram tells you a payment was detected.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="paygram-panel-strong rounded-lg p-5">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
            <span className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <WalletCards aria-hidden className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-950">Receiving wallet</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                New links use this TON testnet address. Existing links keep their original recipient snapshot.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <WalletSettingsForm currentAddress={wallet?.tonAddress} />
          </div>
        </section>

        <section className="paygram-panel-strong rounded-lg p-5">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
            <span className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Bell aria-hidden className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-950">Telegram notifications</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Connect the bot to receive a message when PayGram detects a matching transfer.
              </p>
            </div>
          </div>

          <TelegramNotificationStatus
            initialConnected={Boolean(user.telegramChatId)}
            telegramLink={telegramLink}
          />
        </section>
      </div>
    </div>
  );
}
