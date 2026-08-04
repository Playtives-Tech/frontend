export const queryKeys = {
  account: { all: ['account'] as const, profile: () => ['account', 'profile'] as const },
  opportunities: {
    all: ['opportunities'] as const,
    list: (filters?: Readonly<Record<string, string>>) =>
      ['opportunities', 'list', filters ?? {}] as const,
    detail: (id: string) => ['opportunities', 'detail', id] as const,
  },
  ownership: { all: ['ownership'] as const, summary: () => ['ownership', 'summary'] as const },
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
  },
} as const;
