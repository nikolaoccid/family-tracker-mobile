import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['node_modules/**', '.expo/**', 'dist/**', 'coverage/**', 'android/**', 'ios/**', '*.config.js', 'babel.config.js', 'withLargeHeap.js'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, __DEV__: 'readonly' } },
    plugins: { 'react-hooks': reactHooks, boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true, project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**', partialMatch: false },
        { type: 'bootstrap', pattern: 'bootstrap/**', partialMatch: false },
        { type: 'demo', pattern: 'demo/**', partialMatch: false },
        { type: 'fixtures', pattern: 'fixtures/**', partialMatch: false },
        { type: 'feature', pattern: 'features/*', capture: ['name'] },
        { type: 'shared', pattern: 'shared/**', partialMatch: false },
      ],
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-expect-error': 'allow-with-description' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Architecture: app is thin, features talk through each other's index, shared knows no feature.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { from: { element: { type: 'app' } }, allow: { to: { element: { type: ['feature', 'shared', 'bootstrap'] } } } },
            { from: { element: { type: 'bootstrap' } }, allow: { to: { element: { type: ['feature', 'shared', 'demo'] } } } },
            { from: { element: { type: 'demo' } }, allow: { to: { element: { type: ['feature', 'shared', 'fixtures'] } } } },
            { from: { element: { type: 'fixtures' } }, allow: { to: { element: { type: ['feature', 'fixtures'] } } } },
            { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
            { from: { element: { type: 'feature' } }, allow: { to: { element: { type: 'shared' } } } },
            // A feature may use another feature, but only through its index (see no-restricted-imports below).
            { from: { element: { type: 'feature' } }, allow: { to: { element: { type: 'feature' } } } },
          ],
        },
      ],
      // Features reach into each other only through `@/features/<name>` (the index), never into its folders.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/features/*/*', '**/features/*/*'], message: 'Import another feature through its index.' },
            { group: ['../../*'], message: 'Do not leave your feature folder with a relative import; use shared or the other feature index.' },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'jest.setup.ts', '__tests__/**'],
    languageOptions: { globals: { ...globals.jest } },
    rules: { '@typescript-eslint/no-explicit-any': 'off', 'boundaries/entry-point': 'off', 'boundaries/element-types': 'off' },
  },
);
