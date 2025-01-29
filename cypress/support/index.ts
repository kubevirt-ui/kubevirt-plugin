/* eslint-disable @typescript-eslint/no-namespace */
import './login.ts';
import './nav.ts';
import './project.ts';
import './resource.ts';
import './selectors.ts';

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

Cypress.Cookies.debug(true);

// ignore fetch in command log
const origLog = Cypress.log;
Cypress.log = function (opts, ...other) {
  if (opts.displayName === 'fetch') {
    return;
  }
  return origLog(opts, ...other);
};
