module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': ['warn'],
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/no-non-null-assertion': ['warn'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': ['error'],
    'no-var': ['error']
  },
  env: {
    node: true,
    es2020: true
  },
  overrides: [
    {
      files: ['tests/**/*.ts'],
      env: {
        node: true,
        jest: true
      }
    }
  ]
};