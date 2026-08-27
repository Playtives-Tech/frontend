'use client';

import { useState } from 'react';
import type { Opportunity } from '@/lib/opportunities';
import { isOpportunityOpenForAcquisition } from '@/lib/opportunities';
import { OpportunityOverview } from './opportunity-overview';
import { PositionSelector } from './position-selector';
import { WalletCheckout } from './wallet-checkout';

type OwnershipStep = 'overview' | 'positions' | 'checkout';
type OwnershipFlowProps = Readonly<{ opportunity: Opportunity }>;

export function OwnershipFlow({ opportunity }: OwnershipFlowProps): React.JSX.Element {
  const [step, setStep] = useState<OwnershipStep>('overview');
  const [quantity, setQuantity] = useState(1);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const canAcquire = isOpportunityOpenForAcquisition(opportunity);
  if (step === 'positions' && canAcquire)
    return (
      <PositionSelector
        opportunity={opportunity}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onContinue={() => setStep('checkout')}
        onBack={() => setStep('overview')}
      />
    );
  if (step === 'checkout' && canAcquire)
    return (
      <WalletCheckout
        opportunity={opportunity}
        quantity={quantity}
        agreementAccepted={agreementAccepted}
        onBack={() => setStep('positions')}
      />
    );
  return (
    <OpportunityOverview
      opportunity={opportunity}
      agreementAccepted={agreementAccepted}
      onAgreementAccepted={() => setAgreementAccepted(true)}
      onContinue={canAcquire ? () => setStep('positions') : undefined}
    />
  );
}
