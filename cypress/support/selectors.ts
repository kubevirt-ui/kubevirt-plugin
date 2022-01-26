/* eslint-disable @typescript-eslint/no-use-before-define */
import Loggable = Cypress.Loggable;
import Timeoutable = Cypress.Timeoutable;
import Withinable = Cypress.Withinable;
import Shadow = Cypress.Shadow;

export {};
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      byTestID(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable;
      byTestActionID(selector: string): Chainable;
      byLegacyTestID(selector: string): Chainable;
      byTestOperandLink(selector: string): Chainable;
      byTestRows(selector: string): Chainable;
      clickNavLink(path: [string, string?]): Chainable;
      byTestOperatorRow(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable;
    }
  }
}

Cypress.Commands.add(
  'byTestID',
  (selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.get(`[data-test="${selector}"]`, options);
  },
);

Cypress.Commands.add('byLegacyTestID', (selector: string) =>
  cy.get(`[data-test-id="${selector}"]`),
);

Cypress.Commands.add('byTestOperandLink', (selector: string) =>
  cy.get(`[data-test-operand-link="${selector}"]`),
);

Cypress.Commands.add('byTestRows', (selector: string) => cy.get(`[data-test-rows="${selector}"]`));

Cypress.Commands.add('byTestActionID', (selector: string) =>
  cy.get(`[data-test-action="${selector}"]:not(.pf-m-disabled)`),
);
Cypress.Commands.add('byTestOperatorRow', (selector: string, options?: object) =>
  cy.get(`[data-test-operator-row="${selector}"]`, options),
);
Cypress.Commands.add('clickNavLink', (path: [string, string?]) => {
  cy.byTestID('nav', { timeout: 10000 })
    .contains(path[0], { timeout: 10000 })
    .should(($el) => {
      if ($el.attr('aria-expanded') == 'false') {
        $el.click();
      }
    });
  if (path.length > 1) {
    cy.get('#page-sidebar').contains(path[1]).click();
  }
});
