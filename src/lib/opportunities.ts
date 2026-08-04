export const opportunityCategories = [
  'All',
  'Agriculture',
  'Real estate',
  'Infrastructure',
  'Manufacturing',
] as const;

export type OpportunityCategory = (typeof opportunityCategories)[number];

export type Opportunity = Readonly<{
  slug: string;
  title: string;
  category: Exclude<OpportunityCategory, 'All'>;
  description: string;
  returnRate: string;
  minimum: string;
  duration: string;
  location: string;
  availability: string;
  positionPrice: number;
  positionsAvailable: number;
  positionsTotal: number;
  maxPositionsPerMember: number;
  ownershipModel: 'Co-ownership' | 'Full ownership';
  returnSchedule: 'Fixed monthly' | 'At maturity';
  rollover: boolean;
  operator: string;
  about: string;
  image: string;
  alt: string;
}>;

export const opportunities: readonly Opportunity[] = [
  {
    slug: 'palm-oil-supply-chain',
    title: 'Palm oil supply chain',
    category: 'Agriculture',
    description: 'Co-own a verified palm oil supply cycle serving commercial manufacturers.',
    returnRate: '18.4%',
    minimum: '₦250,000',
    duration: '6 months',
    location: 'Lagos, Nigeria',
    availability: '2 positions available',
    positionPrice: 7_500_000,
    positionsAvailable: 2,
    positionsTotal: 12,
    maxPositionsPerMember: 2,
    ownershipModel: 'Co-ownership',
    returnSchedule: 'Fixed monthly',
    rollover: true,
    operator: 'Idumi Commodities Limited',
    about:
      'This opportunity funds the purchase, quality verification, transport, and delivery of premium palm oil to verified commercial buyers in Nigeria.',
    image:
      'https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=1200&q=80',
    alt: 'Fresh palm fruit bunches ready for processing',
  },
  {
    slug: 'urban-logistics-network',
    title: 'Urban logistics network',
    category: 'Infrastructure',
    description: 'Support a growing urban warehousing and last-mile distribution network.',
    returnRate: '16.8%',
    minimum: '₦500,000',
    duration: '12 months',
    location: 'Abuja, Nigeria',
    availability: '8 positions available',
    positionPrice: 500_000,
    positionsAvailable: 8,
    positionsTotal: 24,
    maxPositionsPerMember: 4,
    ownershipModel: 'Co-ownership',
    returnSchedule: 'At maturity',
    rollover: false,
    operator: 'Transit Works Limited',
    about:
      'This opportunity supports distribution infrastructure with contracted operators and a clear commercial delivery timeline.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Warehouse shelving for an urban logistics operation',
  },
  {
    slug: 'student-living-spaces',
    title: 'Student living spaces',
    category: 'Real estate',
    description: 'Participate in well-managed accommodation close to higher education campuses.',
    returnRate: '15.2%',
    minimum: '₦300,000',
    duration: '18 months',
    location: 'Ibadan, Nigeria',
    availability: '5 positions available',
    positionPrice: 300_000,
    positionsAvailable: 5,
    positionsTotal: 18,
    maxPositionsPerMember: 3,
    ownershipModel: 'Co-ownership',
    returnSchedule: 'Fixed monthly',
    rollover: true,
    operator: 'Campus Living Partners',
    about:
      'This opportunity supports professionally managed housing that serves students close to established university communities.',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    alt: 'Students studying together in a modern learning space',
  },
  {
    slug: 'food-processing-hub',
    title: 'Food processing hub',
    category: 'Manufacturing',
    description:
      'Back essential food processing capacity for a growing regional distribution base.',
    returnRate: '17.1%',
    minimum: '₦400,000',
    duration: '9 months',
    location: 'Ogun, Nigeria',
    availability: '4 positions available',
    positionPrice: 400_000,
    positionsAvailable: 4,
    positionsTotal: 16,
    maxPositionsPerMember: 2,
    ownershipModel: 'Co-ownership',
    returnSchedule: 'Fixed monthly',
    rollover: false,
    operator: 'Harvest Processing Company',
    about:
      'This opportunity backs processing capacity for an established network of regional food distributors.',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Food preparation in a modern commercial kitchen',
  },
] as const;
