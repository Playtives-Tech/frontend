import { api } from './api';

export type ProductEventName =
  | 'opportunities_viewed' | 'opportunity_search_used' | 'opportunity_filter_used'
  | 'opportunity_sort_changed' | 'opportunity_card_clicked' | 'opportunity_viewed'
  | 'opportunity_about_viewed' | 'opportunity_risk_viewed' | 'opportunity_agreement_viewed'
  | 'opportunity_fully_funded_viewed' | 'related_opportunity_clicked'
  | 'opportunity_participation_started' | 'opportunity_units_selected'
  | 'opportunity_participation_reviewed' | 'opportunity_agreement_accepted'
  | 'opportunity_participation_confirmed' | 'opportunity_participation_failed'
  | 'portfolio_viewed' | 'portfolio_position_viewed' | 'portfolio_filter_used'
  | 'wealth_builder_score_viewed' | 'collective_viewed' | 'leaderboard_viewed'
  | 'wallet_viewed' | 'wallet_funding_started' | 'wallet_funding_submitted' | 'wallet_funding_failed'
  | 'wallet_withdrawal_started' | 'wallet_withdrawal_submitted' | 'wallet_withdrawal_failed'
  | 'wealth_goal_started' | 'wealth_goal_skipped';

export function trackEvent(name: ProductEventName, properties: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined') return;
  void api<{ recorded: true }>('/v1/member/product-events', {
    method: 'POST', body: JSON.stringify({ name, properties }),
  }).catch(() => undefined);
}
