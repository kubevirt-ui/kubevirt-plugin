/* eslint @typescript-eslint/no-var-requires: "off" */
const { defineConfig } = require('cypress');
const plugin = require('./plugin.js');

module.exports = defineConfig({
  defaultCommandTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    baseUrl: process.env.BRIDGE_BASE_ADDRESS,
    injectDocumentDomain: true,

    setupNodeEvents(on, config) {
      config.baseUrl = `${process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000'}${(
        process.env.BRIDGE_BASE_PATH || '/'
      ).replace(/\/$/, '')}`;
      config.env.BRIDGE_HTPASSWD_IDP = process.env.BRIDGE_HTPASSWD_IDP;
      config.env.BRIDGE_HTPASSWD_USERNAME = process.env.BRIDGE_HTPASSWD_USERNAME;
      config.env.BRIDGE_HTPASSWD_PASSWORD = process.env.BRIDGE_HTPASSWD_PASSWORD;
      config.env.BRIDGE_KUBEADMIN_PASSWORD = process.env.BRIDGE_KUBEADMIN_PASSWORD;

      plugin(on, config);
      return config;
    },
    specPattern: 'tests/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'support/index.ts',
    testIsolation: false,
  },
  experimentalMemoryManagement: true,
  fixturesFolder: 'fixtures',
  modifyObstructiveCode: false,
  pageLoadTimeout: 120000,
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
  viewportHeight: 1200,
  viewportWidth: 1920,
  waitForAnimations: true,
  watchForFileChanges: false,
});
