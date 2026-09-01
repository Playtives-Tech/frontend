import { ResetPasswordScreen } from '@/components/auth/password-reset-screen';

export default async function ResetPasswordPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ token?: string }> }>): Promise<React.JSX.Element> {
  const { token } = await searchParams;
  return <ResetPasswordScreen token={token ?? null} />;
}
