module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
    '@vue/prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': ['error', { singleQuote: true }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    expect: true,
    describe: true,
    it: true,
    test: true,
    beforeEach: true,
    afterEach: true,
    before: true,
    after: true,
    jest: true
  }
};
