import type { LucideIcon } from 'lucide-react';
import { BookOpen, Compass, House, PieChart, UserRound } from 'lucide-react';

export type NavigationItem = Readonly<{ href: string; label: string; icon: LucideIcon }>;

export const navigationItems = [
  { href: '/', label: 'Home', icon: House },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/ownership', label: 'My Ownership', icon: PieChart },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: UserRound },
] as const satisfies readonly NavigationItem[];
