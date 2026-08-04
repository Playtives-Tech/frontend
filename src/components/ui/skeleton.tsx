import { cn } from '@/lib/utils';
type SkeletonProps = Readonly<React.HTMLAttributes<HTMLDivElement>>;
export function Skeleton({ className, ...props }: SkeletonProps): React.JSX.Element {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} {...props} />;
}
