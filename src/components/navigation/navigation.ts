import type { TablerIcon } from '@tabler/icons-react';
import {
  IconCompass,
  IconHome,
  IconChartPie,
  IconUsersGroup,
  IconUserCircle,
} from '@tabler/icons-react';

export type NavigationItem = Readonly<{ href: string; label: string; icon: TablerIcon }>;

export const navigationItems = [
  { href: '/', label: 'Home', icon: IconHome },
  { href: '/discover', label: 'Opportunities', icon: IconCompass },
  { href: '/ownership', label: 'My Portfolio', icon: IconChartPie },
  { href: '/collectives', label: 'Wealth Collectives', icon: IconUsersGroup },
  { href: '/profile', label: 'Account', icon: IconUserCircle },
] as const satisfies readonly NavigationItem[];

export const sidebarNavigationItems = [
  { href: '/', label: 'Home', icon: IconHome },
  { href: '/discover', label: 'Opportunities', icon: IconCompass },
  { href: '/ownership', label: 'My Portfolio', icon: IconChartPie },
  { href: '/collectives', label: 'Wealth Collectives', icon: IconUsersGroup },
  { href: '/profile', label: 'Account', icon: IconUserCircle },
] as const satisfies readonly NavigationItem[];
