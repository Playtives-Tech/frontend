import { ArrowRight, Clock3 } from 'lucide-react';
import Link from 'next/link';

export default function CollectivesComingSoonPage(): React.JSX.Element {
  return (
    <div className="w-full px-4 py-6 sm:px-8 lg:py-10 mt-10">
      <section className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-emerald-900/15 bg-[linear-gradient(145deg,#07523b_0%,#0b6045_52%,#36703d_100%)] px-5 py-10 text-white shadow-[0_24px_70px_rgba(5,70,49,0.18)] sm:px-10 sm:py-14 lg:px-14">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/[0.07]" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full border-[42px] border-white/[0.05]" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
            <Clock3 className="size-3.5" /> Coming soon
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/65">
            Playtives Wealth Collective
          </p>
          <h1 className="mt-3 max-w-2xl font-sans text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Building wealth together.
          </h1>
          <p className="text-white/72 mt-5 max-w-2xl text-sm leading-7 sm:text-base">
            We are preparing a new collective experience for members who want to commit capital,
            stay consistent, and access opportunities as a community
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-emerald-950 transition hover:bg-white/90"
            >
              Explore current opportunities <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
