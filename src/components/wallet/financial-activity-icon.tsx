import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconBuildingBank,
  IconChartLine,
  IconClock,
  IconReceipt,
  IconFingerprint,
  IconWallet,
} from '@tabler/icons-react';

export function FinancialActivityIcon({
  action,
  className,
}: Readonly<{ action: string; className?: string }>): React.JSX.Element {
  const Icon = action === 'EARNINGS_CREDITED'
    ? IconChartLine
    : ['DEPOSIT_APPROVED', 'WALLET_FUNDED_BY_CARD'].includes(action)
      ? IconArrowDownLeft
      : ['WITHDRAWAL_COMPLETED', 'WITHDRAWAL_FEE_CHARGED'].includes(action)
        ? IconArrowUpRight
        : ['DEPOSIT_REQUESTED', 'WITHDRAWAL_REQUESTED'].includes(action)
          ? IconClock
          : ['BANK_ACCOUNT_LINKED', 'BANK_ACCOUNT_REMOVED'].includes(action)
            ? IconBuildingBank
            : ['PHONE_VERIFIED', 'BVN_VERIFIED', 'NIN_VERIFIED'].includes(action)
              ? IconFingerprint
              : action === 'OPPORTUNITY_ACQUIRED'
                ? IconReceipt
                : IconWallet;

  return <Icon className={className} stroke={1.8} aria-hidden="true" />;
}
