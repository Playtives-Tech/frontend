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
    <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-10">
      <div className="max-w-2xl">
        <span className="bg-brand/12 mb-6 grid size-12 place-items-center rounded-2xl text-brand">
          <Icon className="size-8" />
        </span>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
        <span className="mt-10 inline-flex w-fit items-center gap-2 rounded-xl border bg-surface px-4 py-2.5 text-sm font-medium text-muted-foreground">
          Coming soon <ArrowUpRight className="size-4" />
        </span>
      </div>
    </section>
  );
}
