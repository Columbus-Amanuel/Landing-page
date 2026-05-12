import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^[A-Z_]',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // shadcn/ui primitives co-locate helper exports (variants, contexts) with
      // their components. React Fast Refresh tolerates this fine in Vite.
      'react-refresh/only-export-components': 'off',
      // React 19 + the new compiler allow setting state in effects for the
      // lifecycle patterns we use (loading flags, derived data). The rule is
      // overzealous here and is downgraded to a warning.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'warn',
      // react-hook-form's `watch()` is a fundamental API for our forms and is
      // by design not memoizable. React Compiler simply skips memoization for
      // components that use it, which is acceptable for our use case.
      'react-hooks/incompatible-library': 'off',
    },
  },
])
