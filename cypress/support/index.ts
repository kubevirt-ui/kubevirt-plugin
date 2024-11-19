import './login.ts';
import './nav.ts';
import './project.ts';
import './resource.ts';
import './selectors.ts';
import './views.ts';

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
