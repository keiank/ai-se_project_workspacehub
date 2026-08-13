const path = require('path');

// Import parser and plugins
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const reactRefreshPlugin = require('eslint-plugin-react-refresh');
const prettierConfig = require('eslint-config-prettier');

// Prefer the type-checked recommended config variants when available
const tsTypeCheckedConfig =
  tsPlugin.configs['recommended-requiring-type-checking'] ||
  tsPlugin.configs['recommended-type-checked'] ||
  tsPlugin.configs.recommended ||
  {};
const tsRules = tsTypeCheckedConfig.rules || {};

const reactHooksRules = (reactHooksPlugin.configs && reactHooksPlugin.configs.recommended && reactHooksPlugin.configs.recommended.rules) || {};

// Prettier rules (applied last to override style rules)
const prettierRules =
  (prettierConfig && prettierConfig.rules) ||
  (prettierConfig && prettierConfig.configs && prettierConfig.configs.recommended && prettierConfig.configs.recommended.rules) ||
  {};

module.exports = [
  // Ignore common folders
  {
    ignores: ['**/node_modules/**', 'dist/**'],
  },

  // Client (React) files: type-aware parsing and recommended type-checked rules
  {
    files: ['client/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'client/tsconfig.app.json')],
        tsconfigRootDir: path.resolve(__dirname, 'client'),
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...tsRules,
      ...reactHooksRules,
    },
  },

  // Server files: type-aware parsing and recommended type-checked rules
  {
    files: ['server/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'server/tsconfig.json')],
        tsconfigRootDir: path.resolve(__dirname, 'server'),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsRules,
    },
  },

  // Prettier: apply last to disable conflicting stylistic rules
  {
    files: ['**/*.{ts,tsx,js,jsx,css,scss,md,json}'],
    rules: {
      ...prettierRules,
    },
  },
];
