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
      byButtonText(selector: string): Chainable;
      byLegacyTestID(selector: string): Chainable;
      byTestActionID(selector: string): Chainable;
      byTestID(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable;
      byTestOperandLink(selector: string): Chainable;
      byTestOperatorRow(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable;
      byTestRows(selector: string): Chainable;
      clickNavLink(path: [string, string?]): Chainable;
      clickVirtLink(path: string): void;
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

Cypress.Commands.add('byButtonText', (selector: string) =>
  cy.contains('button[type="button"]', `${selector}`),
);

Cypress.Commands.add('clickVirtLink', (navItemSelector: string) => {
  // Expand the sidebar if it was auto-collapsed, so nav items are clickable.
  cy.get('body').then(($body) => {
    const sidebar = $body.find('.pf-v5-c-page__sidebar, .pf-v6-c-page__sidebar');
    if (sidebar.hasClass('pf-m-collapsed')) {
      // eslint-disable-next-line cypress/no-force
      cy.get('#nav-toggle, [aria-label="Side navigation toggle"]').first().click({ force: true });
    }
  });

  // The PatternFly 6 expandable nav button can exist in the DOM while being
  // clipped by the scrollable sidebar container, which fails Cypress's
  // default 'visible' check even though it is reachable. Scroll it into view
  // and use a force click so clipping doesn't block the expand/click.
  cy.get('[data-test-id="virtualization-nav-item"]', { timeout: 10000 })
    .scrollIntoView()
    .then(($el) => {
      if ($el.attr('aria-expanded') == 'false') {
        // eslint-disable-next-line cypress/no-force
        cy.wrap($el).click({ force: true });
      }
    });
  // eslint-disable-next-line cypress/no-force
  cy.get(navItemSelector).scrollIntoView().click({ force: true });
});
