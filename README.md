# Playtives Web

The public investment experience for Playtives, built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, and Zustand.

## Getting started

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` and the server-only `API_SECRET`.
3. Run `pnpm install`.
4. Start the app with `pnpm dev`.

## Scripts

| Command       | Purpose                                |
| ------------- | -------------------------------------- |
| `pnpm dev`    | Run the local development server       |
| `pnpm build`  | Create a production build              |
| `pnpm start`  | Serve the production build             |
| `pnpm lint`   | Run ESLint with zero warnings allowed  |
| `pnpm format` | Format application files with Prettier |

## Architecture

```text
src/
  app/                 Routes, layouts, loading/error states, metadata
  components/
    auth/              Account access components
    dashboard/         Home-screen composition and feature cards
    navigation/        Responsive sidebar and mobile navigation
    providers/         Query, theme, notification, and app providers
    ui/                Reusable visual primitives
  hooks/               Reusable React hooks
  lib/
    query/             Query keys and typed query option factories
    api.ts             Typed HTTP client and API error model
    notify.ts          Central toast helper
  stores/              Local UI and display-only simulated session state
  styles/              Global CSS and design tokens
  types/               Shared TypeScript declarations and domain types
```

Routes should compose feature components. Feature components own their presentation and receive typed data through props. Low-level components must remain domain-agnostic and live under `components/ui`.

## Styling

- Tailwind is the default styling layer.
- Global color tokens live in `src/styles/globals.css`; use semantic utilities such as `bg-brand`, `text-muted-foreground`, and `border-border` instead of raw colors.
- The desktop sidebar and mobile bottom navigation share the same navigation definition.
- Design for mobile first, then add responsive breakpoints deliberately.
- Use `font-heading` for display hierarchy and `font-sans` for interface copy.
- Use the shared `Skeleton` component for loading layouts and Sonner through `notify` for messaging.

## Code style

- TypeScript strict mode is mandatory. Do not introduce `any`.
- Use `Readonly` for immutable component props and domain data.
- Prefer named components and explicit prop types.
- Keep JSX visually spaced: separate meaningful sibling regions with blank lines and extract repeated layout into components.
- Keep route pages thin. Move reusable, domain-specific UI into the matching feature directory.
- Keep API access in `src/lib/api.ts` and expose server data through typed TanStack Query option factories.
- Keep Zustand for local client state only. Do not store credentials, tokens, or sensitive account information in browser persistence.
- Use `@/` imports for source files.

## Data and state

TanStack Query owns remote server state. Query keys live in `src/lib/query/query-keys.ts`, and query option factories live in `src/lib/query/query-options.ts`. Zustand owns transient interface state and the current display-only authentication simulation. Replace the simulation with HTTP-only cookie-backed authentication before connecting production identity flows.

## Environment

| Variable              | Scope              | Description                                  |
| --------------------- | ------------------ | -------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Browser and server | Base URL for the Playtives API               |
| `API_SECRET`          | Server only        | Secret reserved for server-side integrations |
