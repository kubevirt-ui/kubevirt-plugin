import { MINUTE } from '../utils/const/index';

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
  // save redundant switching
  let current;
  cy.get(header, { timeout: 3 * MINUTE }).within(($title) => {
    current = $title.find('h2').text();
    if (current == perspective) {
      cy.task('log', `        [${current}] => [${perspective}]`);
      return;
    }
    cy.get(toggle).scrollIntoView();
    cy.get(toggle).click();
    cy.get(menu).should('be.visible');
    cy.task('log', `        Switch ${current} to ${perspective}`);
    cy.contains(option, perspective).click();
  });
};
