export type CountryDialCode = Readonly<{
  country: string;
  code: string;
  flag: string;
}>;

export const countryDialCodes: readonly CountryDialCode[] = [
  { country: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { country: 'Ghana', code: '+233', flag: '🇬🇭' },
  { country: 'Kenya', code: '+254', flag: '🇰🇪' },
  { country: 'South Africa', code: '+27', flag: '🇿🇦' },
  { country: 'Uganda', code: '+256', flag: '🇺🇬' },
  { country: 'Tanzania', code: '+255', flag: '🇹🇿' },
  { country: 'Rwanda', code: '+250', flag: '🇷🇼' },
  { country: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { country: 'Senegal', code: '+221', flag: '🇸🇳' },
  { country: 'Ivory Coast', code: '+225', flag: '🇨🇮' },
  { country: 'Zambia', code: '+260', flag: '🇿🇲' },
  { country: 'Zimbabwe', code: '+263', flag: '🇿🇼' },
  { country: 'Botswana', code: '+267', flag: '🇧🇼' },
  { country: 'Egypt', code: '+20', flag: '🇪🇬' },
  { country: 'Morocco', code: '+212', flag: '🇲🇦' },
  { country: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { country: 'United States / Canada', code: '+1', flag: '🇺🇸' },
  { country: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { country: 'Ireland', code: '+353', flag: '🇮🇪' },
  { country: 'Germany', code: '+49', flag: '🇩🇪' },
  { country: 'France', code: '+33', flag: '🇫🇷' },
  { country: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { country: 'Australia', code: '+61', flag: '🇦🇺' },
];

export function dialCodeForCountry(country: string | null | undefined): string {
  if (country === 'United States' || country === 'Canada') return '+1';
  return countryDialCodes.find((option) => option.country === country)?.code ?? '+234';
}
