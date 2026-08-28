import type { LucideIcon } from 'lucide-react';
import { Bell, BookOpen, Compass, House, PieChart, UserRound, WalletCards } from 'lucide-react';

export type NavigationItem = Readonly<{ href: string; label: string; icon: LucideIcon }>;

export const navigationItems = [
  { href: '/', label: 'Home', icon: House },
  { href: '/discover', label: 'Opportunities', icon: Compass },
  { href: '/ownership', label: 'My Portfolio', icon: PieChart },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/profile', label: 'Account', icon: UserRound },
] as const satisfies readonly NavigationItem[];

export const sidebarNavigationItems = [
  { href: '/', label: 'Home', icon: House },
  { href: '/discover', label: 'Opportunities', icon: Compass },
  { href: '/ownership', label: 'My Portfolio', icon: PieChart },
  // { href: '/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/profile', label: 'Account', icon: UserRound },
  // { href: '/notifications', label: 'Notifications', icon: Bell },
] as const satisfies readonly NavigationItem[];
