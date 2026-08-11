'use client';

import { useState } from 'react';
import type { Opportunity } from '@/lib/opportunities';
import { OpportunityOverview } from './opportunity-overview';
import { PositionSelector } from './position-selector';
import { WalletCheckout } from './wallet-checkout';

type OwnershipStep = 'overview' | 'positions' | 'checkout';
type OwnershipFlowProps = Readonly<{ opportunity: Opportunity }>;

export function OwnershipFlow({ opportunity }: OwnershipFlowProps): React.JSX.Element {
  const [step, setStep] = useState<OwnershipStep>('overview');
  const [quantity, setQuantity] = useState(1);
  if (step === 'positions')
    return (
      <PositionSelector
        opportunity={opportunity}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onContinue={() => setStep('checkout')}
        onBack={() => setStep('overview')}
      />
    );
  if (step === 'checkout')
    return (
      <WalletCheckout
        opportunity={opportunity}
        quantity={quantity}
        onBack={() => setStep('positions')}
      />
    );
  return <OpportunityOverview opportunity={opportunity} />;
}
