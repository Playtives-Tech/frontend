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
    <section className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-2xl flex-col justify-center px-5 py-8 sm:px-8 lg:px-10">
      <div className="max-w-xl">
        <span className="bg-brand/12 mb-4 grid size-10 place-items-center rounded-xl text-brand">
          <Icon className="size-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">{eyebrow}</p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
        <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground">
          Coming soon <ArrowUpRight className="size-4" />
        </span>
      </div>
    </section>
  );
}
