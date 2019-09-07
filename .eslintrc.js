module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es6: true
  },
  extends: ['eslint:recommended'],
  rules: {
    semi: ['error', 'never']
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/semi': ['error', 'never'],
        '@typescript-eslint/member-delimiter-style': [
          'error',
          { multiline: { delimiter: 'none' } }
        ]
      }
    }
  ]
};
