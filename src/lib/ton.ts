import { Address, beginCell } from "@ton/core";

const NANO_PER_TON = 1_000_000_000n;

export function parseTonToNano(input: string) {
  const value = input.trim();

  if (!/^\d+(\.\d{1,9})?$/.test(value)) {
    throw new Error("Enter a positive TON amount with up to 9 decimals.");
  }

  const [whole, fraction = ""] = value.split(".");
  const wholeNano = BigInt(whole) * NANO_PER_TON;
  const fractionNano = BigInt(fraction.padEnd(9, "0"));
  const total = wholeNano + fractionNano;

  if (total <= 0n) {
    throw new Error("Amount must be greater than 0 TON.");
  }

  return total;
}

export function formatNanoTon(value: bigint | string | number) {
  const nano = BigInt(value);
  const whole = nano / NANO_PER_TON;
  const fraction = nano % NANO_PER_TON;
  const fractionText = fraction.toString().padStart(9, "0").replace(/0+$/, "");
  return fractionText ? `${whole}.${fractionText}` : whole.toString();
}

export function normalizeTonAddress(input: string) {
  const address = Address.parse(input.trim());
  return address.toString({ bounceable: false, testOnly: true });
}

export function isValidTonAddress(input: string) {
  try {
    normalizeTonAddress(input);
    return true;
  } catch {
    return false;
  }
}

export function buildTonTransferCommentPayload(memo: string) {
  return beginCell().storeUint(0, 32).storeStringTail(memo).endCell().toBoc().toString("base64");
}

