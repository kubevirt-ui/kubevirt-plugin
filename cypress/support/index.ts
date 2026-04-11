// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../@types/console/index.d.ts" />

/* eslint-disable @typescript-eslint/no-namespace */
import { set } from 'lodash';

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
// even after Cypress clears localStorage between it() blocks. Merges into any existing
// value so unrelated settings are not overwritten.
const completeGuidedTours = (existing: Record<string, unknown>, perspectives: string[]) => {
  perspectives.forEach((perspective) => {
    set(existing, `'console.guidedTour'.${perspective}.completed`, true);
  });
  return existing;
};

// The key for the console user settings in localStorage, but only when console is running with auth disabled.
const CONSOLE_USER_SETTINGS_KEY = 'console-user-settings';

Cypress.on('window:before:load', (win) => {
  let existing: Record<string, unknown>;

  try {
    const raw = win.localStorage.getItem(CONSOLE_USER_SETTINGS_KEY);
    existing = raw ? JSON.parse(raw) : {};
  } catch {
    existing = {};
  }

  existing = completeGuidedTours(existing, ['admin', 'virtualization-perspective']);
  win.localStorage.setItem(CONSOLE_USER_SETTINGS_KEY, JSON.stringify(existing));
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
