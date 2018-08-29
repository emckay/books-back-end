module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    'prefer-const': 'error',
    'no-console': 'off',
  },
  parserOptions: {
    ecmaVersion: 8,
  },
  overrides: [
    {
      files: '**/*.spec.js',
      env: {
        jest: true,
      },
    },
  ],
};
