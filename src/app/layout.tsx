import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { TonConnectProvider } from "@/components/ton-connect-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PayGram Link",
  description: "Create a TON payment link in seconds. Share it anywhere. Get paid in Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">
        <TonConnectProvider
          manifestUrl={
            process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ??
            `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/tonconnect-manifest.json`
          }
        >
          {children}
        </TonConnectProvider>
      </body>
    </html>
  );
}
