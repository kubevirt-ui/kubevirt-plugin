import { MINUTE, SECOND } from '../utils/const/index';

export enum Perspective {
  Administrator = 'Administrator',
  Developer = 'Developer',
  Virtualization = 'Virtualization',
}

export const tour = '[data-test="tour-step-footer-secondary"]';
export const topology = '[data-test-id="topology-header"]';

const header = '[data-quickstart-id="qs-perspective-switcher"]';
const option = '[data-test-id="perspective-switcher-menu-option"]';
const toggle = '[data-test-id="perspective-switcher-toggle"]';
const menu = '[data-test-id="perspective-switcher-menu"]';

export const switchPerspective = (perspective: Perspective) => {
  cy.get(header, { timeout: 5 * MINUTE }).should('be.visible');
  cy.wait(10 * SECOND); // for safety and remove flaky
  cy.get(header).within(($title) => {
    if ($title.find('h2').text() !== perspective) {
      cy.get(toggle).click();
      cy.get(menu).should('be.visible');
      cy.contains(option, perspective).click();
    }
  });
};
