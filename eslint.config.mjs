import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '*.config.mjs'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    plugins: { '@next/next': nextPlugin },
  },
];
