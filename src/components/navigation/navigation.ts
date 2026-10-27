import type { LucideIcon } from 'lucide-react';
import {
  Compass,
  House,
  Newspaper,
  PieChart,
  PiggyBank,
  UserRound,
} from 'lucide-react';

export type NavigationItem = Readonly<{ href: string; label: string; icon: LucideIcon }>;

export const navigationItems = [
  { href: '/', label: 'Home', icon: House },
  { href: '/discover', label: 'Opportunities', icon: Compass },
  { href: '/ownership', label: 'My Portfolio', icon: PieChart },
  { href: '/collectives', label: 'Wealth Collectives', icon: PiggyBank },
  // { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/profile', label: 'Account', icon: UserRound },
] as const satisfies readonly NavigationItem[];

export const sidebarNavigationItems = [
  { href: '/', label: 'Home', icon: House },
  { href: '/discover', label: 'Opportunities', icon: Compass },
  { href: '/ownership', label: 'My Portfolio', icon: PieChart },
  { href: '/collectives', label: 'Wealth Collectives', icon: PiggyBank },
  // { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/profile', label: 'Account', icon: UserRound },
] as const satisfies readonly NavigationItem[];
