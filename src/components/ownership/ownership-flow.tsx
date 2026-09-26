'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Opportunity } from '@/lib/opportunities';
import { isOpportunityOpenForAcquisition } from '@/lib/opportunities';
import { OpportunityOverview } from './opportunity-overview';
import { PositionSelector } from './position-selector';
import { WalletCheckout } from './wallet-checkout';
import { useAuthStore } from '@/stores/use-auth-store';

type OwnershipStep = 'overview' | 'positions' | 'checkout';
type OwnershipFlowProps = Readonly<{ opportunity: Opportunity }>;

export function OwnershipFlow({ opportunity }: OwnershipFlowProps): React.JSX.Element {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState<OwnershipStep>('overview');
  const [quantity, setQuantity] = useState(1);
  const [rolloverElection, setRolloverElection] = useState<'PAYOUT' | 'COMPOUND'>('PAYOUT');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const canAcquire = isOpportunityOpenForAcquisition(opportunity);
  const requiresApproval =
    user?.memberStatus === 'pending' && user.participationAccessApproved !== true;
  if (step === 'positions' && canAcquire)
    return (
      <PositionSelector
        opportunity={opportunity}
        quantity={quantity}
        onQuantityChange={setQuantity}
        rolloverElection={rolloverElection}
        onRolloverElectionChange={setRolloverElection}
        onContinue={() => setStep('checkout')}
        onBack={() => setStep('overview')}
      />
    );
  if (step === 'checkout' && canAcquire)
    return (
      <WalletCheckout
        opportunity={opportunity}
        quantity={quantity}
        onQuantityChange={setQuantity}
        agreementAccepted={agreementAccepted}
        onAgreementAcceptedChange={setAgreementAccepted}
        rolloverElection={rolloverElection}
        onBack={() => setStep('positions')}
      />
    );
  return (
    <OpportunityOverview
      opportunity={opportunity}
      onContinue={
        canAcquire
          ? requiresApproval
            ? () => router.push('/access-request')
            : () => setStep('positions')
          : undefined
      }
      continueLabelOverride={requiresApproval ? 'Request access to participate' : undefined}
    />
  );
}
