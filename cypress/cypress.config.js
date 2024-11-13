/* eslint @typescript-eslint/no-var-requires: "off" */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  defaultCommandTimeout: 15000,
  e2e: {
    // We've imported your old cypress plugins here.
    baseUrl: process.env.BRIDGE_BASE_ADDRESS,
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./plugin.js')(on, config);
    },
    specPattern: 'tests/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'support/index.ts',
    testIsolation: false,
  },
  experimentalMemoryManagement: true,
  fixturesFolder: 'fixtures',
  modifyObstructiveCode: false,
  pageLoadTimeout: 60000,
  reporter: '../node_modules/cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  retries: {
    openMode: 0,
    runMode: 0,
  },
  screenshotOnRunFailure: true,
  screenshotsFolder: './gui-test-screenshots/screenshots/',
  trashAssetsBeforeRuns: true,
  video: true,
  videosFolder: './gui-test-screenshots/videos/',
  viewportHeight: 1080,
  viewportWidth: 1920,
  waitForAnimations: true,
  watchForFileChanges: false,
});
