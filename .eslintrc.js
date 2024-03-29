module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint', 'jest'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/explicit-member-accessibility': ['off'],
    "jest/prefer-expect-assertions": [
      "error",
      { "onlyFunctionsWithAsyncKeyword": true }
    ]
  }
};
