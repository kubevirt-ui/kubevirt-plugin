// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../@types/console/index.d.ts" />

/* eslint-disable @typescript-eslint/no-namespace */
import './login.ts';
import './nav.ts';
import './project.ts';
import './resource.ts';
import './selectors.ts';
import './commands.ts';

declare global {
  namespace Cypress {
    interface Chainable {
      install(encrypted?: boolean): Chainable<Element>;
    }
  }
}

Cypress.on('uncaught:exception', () => {
  // don't fail on Cypress' internal errors.
  return false;
});

// Pre-seed console user settings so guided tours are already marked completed before
// any page JavaScript runs. This prevents the tour popup from appearing on every test,
// even after Cypress clears localStorage between it() blocks.
const CONSOLE_USER_SETTINGS_TOURS_DISMISSED = JSON.stringify({
  'console.guidedTour': {
    admin: { completed: true },
    'virtualization-perspective': { completed: true },
  },
});

Cypress.on('window:before:load', (win) => {
  win.localStorage.setItem('console-user-settings', CONSOLE_USER_SETTINGS_TOURS_DISMISSED);
});

Cypress.Cookies.debug(true);

// ignore fetch in command log
const origLog = Cypress.log;
Cypress.log = function (opts, ...other) {
  if (opts.displayName === 'fetch') {
    return;
  }
  return origLog(opts, ...other);
};
