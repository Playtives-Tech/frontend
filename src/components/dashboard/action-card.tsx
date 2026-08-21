import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ActionCardProps = Readonly<{
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}>;

export function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: ActionCardProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-md"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <h2 className="font-sans text-lg font-bold tracking-normal">{title}</h2>

        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </span>

      <ArrowRight className="size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
