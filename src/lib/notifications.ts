import { formatNanoTon } from "@/lib/ton";

export async function sendTelegramMessage(chatId: string, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return { ok: false, skipped: true, reason: "TELEGRAM_BOT_TOKEN is not configured." };
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }

  return { ok: true, skipped: false };
}

export async function sendPaymentPaidNotification(input: {
  chatId: string | null;
  linkTitle: string;
  amountNano: bigint;
  txHash: string;
}) {
  if (!input.chatId) {
    return { ok: false, skipped: true, reason: "Seller has not linked Telegram notifications." };
  }

  return sendTelegramMessage(
    input.chatId,
    [
      "Payment received on PayGram Link.",
      "",
      `Link: ${input.linkTitle}`,
      `Amount: ${formatNanoTon(input.amountNano)} TON`,
      `Transaction: ${input.txHash}`,
    ].join("\n"),
  );
}

