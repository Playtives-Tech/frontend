import { PaystackPaymentComplete } from '@/components/wallet/paystack-payment-complete';

export default async function PaystackPaymentCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}): Promise<React.JSX.Element> {
  const { reference } = await searchParams;
  return <PaystackPaymentComplete reference={reference} />;
}
