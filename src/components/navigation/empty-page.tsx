import { ArrowUpRight, type LucideIcon } from 'lucide-react';
type EmptyPageProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}>;
export function EmptyPage({
  eyebrow,
  title,
  description,
  icon: Icon,
}: EmptyPageProps): React.JSX.Element {
  return (
    <section className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-2xl place-items-center px-5 py-8 sm:px-8 lg:px-10">
      <div className="w-full max-w-xl rounded-2xl border border-brand/15 bg-background p-6 text-center shadow-[0_18px_40px_-32px_rgba(7,82,59,0.45)] sm:p-8">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand/10 text-brand sm:size-24">
          <Icon className="size-9 sm:size-10" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
        <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-xs font-semibold text-brand">
          Coming soon <ArrowUpRight className="size-4" />
        </span>
      </div>
    </section>
  );
}
