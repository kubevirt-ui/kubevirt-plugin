module.exports = {
  env: {
    'cypress/globals': true,
    node: true,
  },
  extends: [
    '../.eslintrc.js',
    'plugin:cypress/recommended',
    'plugin:chai-friendly/recommended',
  ],
  plugins: ['cypress', 'chai-friendly'],
  rules: {
    'cypress/no-force': 'error',
    'cypress/assertion-before-screenshot': 'error',
    'cypress/require-data-selectors': 'error',
  },
};
