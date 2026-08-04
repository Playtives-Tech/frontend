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
      className="group flex min-h-52 flex-col justify-between rounded-2xl border bg-background p-5 transition hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lg"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-5" />
      </span>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <ArrowRight className="mb-1 size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
