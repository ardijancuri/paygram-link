"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

export function TonConnectProvider({
  children,
  manifestUrl,
}: {
  children: React.ReactNode;
  manifestUrl: string;
}) {
  return <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>;
}

