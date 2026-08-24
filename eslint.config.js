const path = require('path');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  // Extend plugin configs (type-checked TS, react-hooks) and prettier last
  ...compat.extends(
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    'prettier'
  ),

  // Ignore common folders
  {
    ignores: ['**/node_modules/**', 'dist/**'],
  },

  // Client (React) files: type-aware parsing
  {
    files: ['client/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: [path.resolve(__dirname, 'client/tsconfig.app.json')],
        tsconfigRootDir: path.resolve(__dirname, 'client'),
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-refresh': require('eslint-plugin-react-refresh'),
    },
  },

  // Server files: type-aware parsing
  {
    files: ['server/src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: [path.resolve(__dirname, 'server/tsconfig.json')],
        tsconfigRootDir: path.resolve(__dirname, 'server'),
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
