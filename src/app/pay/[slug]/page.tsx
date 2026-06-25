import { notFound } from "next/navigation";

import { CheckoutClient } from "@/components/checkout-client";
import { getPaymentLinkBySlug } from "@/lib/repositories";
import { formatNanoTon } from "@/lib/ton";

export default async function PayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = await getPaymentLinkBySlug(slug);

  if (!link) {
    notFound();
  }

  return (
    <CheckoutClient
      link={{
        id: link.id,
        title: link.title,
        description: link.description,
        amountNano: link.amountNano.toString(),
        amountTon: formatNanoTon(link.amountNano),
        recipientWallet: link.recipientWallet,
        successMessage: link.successMessage,
      }}
    />
  );
}

