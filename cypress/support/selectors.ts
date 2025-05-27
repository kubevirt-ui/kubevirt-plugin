/* eslint-disable @typescript-eslint/no-use-before-define */
import { MINUTE, SECOND } from '../utils/const/index';
import { Perspective, switchPerspective } from '../views/perspective';

export {};

type GetOptions = Parameters<Cypress.Chainable['get']>[1];

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      byButtonText(selector: string): Chainable;
      byLegacyTestID(selector: string): Chainable;
      byTestActionID(selector: string): Chainable;
      byTestID(selector: string | string[], options?: GetOptions): Chainable;
      byTestOperandLink(selector: string): Chainable;
      byTestOperatorRow(selector: string, options?: GetOptions): Chainable;
      byTestRows(selector: string): Chainable;
      checkSubTitle(title: string, timeout?: number): void;
      checkTitle(title: string, timeout?: number): void;
      clickApplyBtn(): void;
      clickNavLink(path: [string, string?]): Chainable;
      clickSaveBtn(): void;
      clickVirtLink(path: string): void;
      switchToVirt(): void;
    }
  }
}

Cypress.Commands.add('byTestID', (selector: string | string[], options?: GetOptions) => {
  const getSelector = Array.isArray(selector)
    ? selector.map((id) => `[data-test="${id}"]`).join(', ')
    : `[data-test="${selector}"]`;
  cy.get(getSelector, options);
});

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
Cypress.Commands.add('byTestOperatorRow', (selector: string, options?: GetOptions) =>
  cy.get(`[data-test-operator-row="${selector}"]`, options),
);
Cypress.Commands.add('clickNavLink', (path: [string, string?]) => {
  cy.byTestID('nav', { timeout: 10 * SECOND })
    .contains(path[0], { timeout: 10 * SECOND })
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
  cy.contains('Virtualization').should('be.visible');
  cy.get('[data-test-id="virtualization-nav-item"]', { timeout: 10 * SECOND }).should(($el) => {
    if ($el.attr('aria-expanded') == 'false') {
      $el.click();
    }
  });
  cy.get(navItemSelector).click();
});

Cypress.Commands.add('clickSaveBtn', () => cy.contains('button[type="button"]', 'Save').click());
Cypress.Commands.add('clickApplyBtn', () => cy.contains('button[type="button"]', 'Apply').click());

Cypress.Commands.add('switchToVirt', () => {
  switchPerspective(Perspective.Virtualization);
});

Cypress.Commands.add('checkTitle', (title: string, timeout?: number) => {
  const t_o = timeout ? timeout : 3 * MINUTE;
  cy.contains('h1', title, { timeout: t_o }).should('exist');
});

Cypress.Commands.add('checkSubTitle', (subTitle: string, timeout?: number) => {
  const t_o = timeout ? timeout : 3 * MINUTE;
  cy.contains('h2', subTitle, { timeout: t_o }).should('exist');
});
