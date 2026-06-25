import { findMatchingAttempt } from "@/lib/payment-matching";
import { sendPaymentPaidNotification } from "@/lib/notifications";
import {
  expireOldPaymentAttempts,
  listDetectablePaymentAttempts,
  markAttemptPaid,
  recordPaymentEvent,
} from "@/lib/repositories";
import { fetchIncomingTonTransfers } from "@/lib/ton-indexer";

export async function detectPayments() {
  const expired = await expireOldPaymentAttempts();
  const records = await listDetectablePaymentAttempts();
  const recipients = Array.from(new Set(records.map((record) => record.recipientWallet)));
  let detected = 0;
  let notified = 0;

  for (const recipientWallet of recipients) {
    const transfers = await fetchIncomingTonTransfers(recipientWallet);
    const attemptsForRecipient = records
      .filter((record) => record.recipientWallet === recipientWallet)
      .map((record) => ({
        id: record.attempt.id,
        expectedAmountNano: record.attempt.expectedAmountNano,
        memo: record.attempt.memo,
        recipientWallet: record.recipientWallet,
        currency: record.attempt.currency,
      }));

    for (const transfer of transfers) {
      const match = findMatchingAttempt(attemptsForRecipient, transfer);
      await recordPaymentEvent({
        rawTxHash: transfer.txHash,
        recipientWallet: transfer.recipientWallet,
        senderWallet: transfer.senderWallet,
        amountNano: transfer.amountNano,
        memo: transfer.memo,
        matchedAttemptId: match?.id ?? null,
        rawPayload: transfer.rawPayload ?? transfer,
      });

      if (!match) {
        continue;
      }

      const paidAttempt = await markAttemptPaid({ attemptId: match.id, txHash: transfer.txHash });

      if (!paidAttempt) {
        continue;
      }

      detected += 1;
      const fullRecord = records.find((record) => record.attempt.id === match.id);

      if (fullRecord) {
        const result = await sendPaymentPaidNotification({
          chatId: fullRecord.telegramChatId,
          linkTitle: fullRecord.linkTitle,
          amountNano: fullRecord.attempt.expectedAmountNano,
          txHash: transfer.txHash,
        });

        if (result.ok) {
          notified += 1;
        }
      }
    }
  }

  return { checkedAttempts: records.length, recipients: recipients.length, detected, notified, expired };
}

