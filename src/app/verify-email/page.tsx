import { VerifyEmailResult } from '@/components/auth/verify-email-result';

export default async function VerifyEmailPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ token?: string }> }>): Promise<React.JSX.Element> {
  const { token } = await searchParams;
  return <VerifyEmailResult token={token ?? null} />;
}
