import Link from 'next/link';
export default function ActivityPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/wallet" className="rounded-lg border px-3 py-2 text-sm font-semibold">
        ← Back to wallet
      </Link>
      <h1 className="mt-8 font-heading text-3xl font-semibold">Wallet activity</h1>
      <div className="mt-6 rounded-2xl border bg-background p-5">
        <p className="font-semibold">Cycle distribution</p>
        <p className="mt-1 text-sm text-muted-foreground">Palm Oil Supply · Cycle 04</p>
        <p className="mt-2 font-semibold text-brand">+₦1,125,000</p>
      </div>
    </div>
  );
}
