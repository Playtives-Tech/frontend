'use client';

import { ArrowRight, ChevronDown, Eye, EyeOff, LogIn, Mail, MapPin, UserPlus, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ComponentProps, type FormEvent, useState } from 'react';
import { ApiError } from '@/lib/api';
import { notify } from '@/lib/notify';
import { login, register, resendVerification } from '@/lib/services/registration-service';
import { useAuthStore } from '@/stores/use-auth-store';
import { ButtonLoadingContent } from '@/components/ui/loading-indicator';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen({ mode }: Readonly<{ mode: AuthMode }>): React.JSX.Element {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const isSignUp = mode === 'sign-up';

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (isSignUp) {
      if (password !== confirmPassword) {
        notify.error('Passwords do not match');
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country,
          gender: gender as 'female' | 'male' | 'non_binary' | 'prefer_not_to_say',
          password,
        });
        setPendingEmail(response.user.email);
        notify.success('Account created', { description: 'Check your email to verify it.' });
      } catch (error: unknown) {
        notify.error(error instanceof ApiError ? error.message : 'Could not create your account');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(email.trim(), password);
      signIn(
        {
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          country: response.user.country,
          gender: response.user.gender,
        },
        response.accessToken,
      );
      notify.success(`Welcome back, ${response.user.name.split(' ')[0]}`, {
        description: 'Your dashboard is ready.',
      });
      router.replace('/');
    } catch (error: unknown) {
      notify.error(error instanceof ApiError ? error.message : 'Could not sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (pendingEmail)
    return (
      <AuthFrame>
        <div className="w-full max-w-md rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Mail className="size-7" />
          </span>
          <h1 className="mt-5 font-sans text-3xl font-semibold">Check your email</h1>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            We sent a verification link to{' '}
            <strong className="text-foreground">{pendingEmail}</strong>. Open it to finish creating
            your account.
          </p>
          <div className="mt-7 grid gap-3">
            <button
              type="button"
              disabled={isResending}
              onClick={() => {
                setIsResending(true);
                void resendVerification(pendingEmail)
                  .then(() => notify.success('A new verification link has been sent'))
                  .catch((error: unknown) =>
                    notify.error(
                      error instanceof ApiError ? error.message : 'Could not resend the link',
                    ),
                  )
                  .finally(() => setIsResending(false));
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground disabled:opacity-60"
            >
              <ButtonLoadingContent loading={isResending} loadingLabel="Sending">
                Resend verification email
              </ButtonLoadingContent>
            </button>
            <Link
              href="/sign-in"
              className="inline-flex h-12 items-center justify-center rounded-xl border font-semibold"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthFrame>
    );

  return (
    <AuthFrame>
      <div className="w-full max-w-md rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
          {isSignUp ? <UserPlus className="size-6" /> : <LogIn className="size-6" />}
        </span>
        <h1 className="mt-5 font-sans text-2xl font-bold">
          {isSignUp ? 'Create an account.' : 'Welcome back to Playtives.'}
        </h1>
        <p className="mt-1 text-[.85rem] text-muted-foreground">
          {isSignUp
            ? 'Save opportunities, fund your wallet, and follow every ownership update from one secure account.'
            : 'Sign in to access your dashboard and ownership journey.'}
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-4 text-left">
          <FloatingField
            id="email"
            label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            type="email"
          />

          {isSignUp ? (
            <FloatingField
              id="name"
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          ) : null}

          {isSignUp ? (
            <FloatingField
              id="phone"
              label="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              required
              type="tel"
            />
          ) : null}

          {isSignUp ? (
            <CountryField value={country} onChange={(event) => setCountry(event.target.value)} />
          ) : null}

          {isSignUp ? (
            <GenderField value={gender} onChange={(event) => setGender(event.target.value)} />
          ) : null}

          <FloatingField
            id="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            type="password"
            minLength={8}
          />

          {isSignUp ? (
            <FloatingField
              id="confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              type="password"
              minLength={8}
            />
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            <ButtonLoadingContent
              loading={isSubmitting}
              loadingLabel={isSignUp ? '' : ''}
              // loadingLabel={isSignUp ? 'Creating account' : 'Signing in'}
              icon={<ArrowRight className="size-4" />}
            >
              {isSignUp ? 'Create my account' : 'Sign in'}
            </ButtonLoadingContent>
          </button>
        </form>

        <p className="mt-6 text-center text-[.8rem] text-muted-foreground">
          {isSignUp ? 'Already have an account?' : 'New to Playtives?'}{' '}
          <Link
            href={isSignUp ? '/sign-in' : '/sign-up'}
            className="font-semibold text-brand hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}

type FloatingFieldProps = Readonly<{
  id: string;
  label: string;
}> &
  ComponentProps<'input'>;

function FloatingField({
  id,
  label,
  className,
  ...inputProps
}: FloatingFieldProps): React.JSX.Element {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = inputProps.type === 'password';

  return (
    <div className="relative">
      <input
        {...inputProps}
        id={id}
        type={isPasswordField && isPasswordVisible ? 'text' : inputProps.type}
        placeholder=" "
        className={`auth-floating-input peer h-12 w-full rounded-xl border bg-background py-0 font-sans text-[12px] outline-none transition focus:border-brand focus:bg-background focus:ring-2 focus:ring-brand/20 ${isPasswordField ? 'pl-4 pr-11' : 'px-4'} ${className ?? ''}`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background px-2 font-sans text-[12px] text-muted-foreground transition-all peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px]"
      >
        {label}
      </label>
      {isPasswordField ? (
        <button
          type="button"
          onClick={() => setIsPasswordVisible((visible) => !visible)}
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          aria-label={
            isPasswordVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          aria-pressed={isPasswordVisible}
        >
          {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}

const countries = [
  'Nigeria',
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo (Congo-Brazzaville)',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czechia',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

function CountryField({
  value,
  onChange,
}: Pick<ComponentProps<'select'>, 'value' | 'onChange'>): React.JSX.Element {
  return (
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand" />
      <select
        id="country"
        name="country"
        value={value}
        onChange={onChange}
        required
        autoComplete="country-name"
        className="h-12 w-full appearance-none rounded-xl border bg-background py-0 pl-10 pr-10 font-sans text-[12px] text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        <option value="" disabled>
          Location (Where do you live)
        </option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function GenderField({
  value,
  onChange,
}: Pick<ComponentProps<'select'>, 'value' | 'onChange'>): React.JSX.Element {
  return (
    <div className="relative">
      <UsersRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand" />
      <select
        id="gender"
        name="gender"
        value={value}
        onChange={onChange}
        required
        className="h-12 w-full appearance-none rounded-xl border bg-background py-0 pl-10 pr-10 font-sans text-[12px] text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        <option value="" disabled>
          Gender
        </option>
        <option value="female">Woman</option>
        <option value="male">Man</option>
        <option value="non_binary">Non-binary</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function AuthFrame({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <main className="app-background flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8">
      {children}
    </main>
  );
}
