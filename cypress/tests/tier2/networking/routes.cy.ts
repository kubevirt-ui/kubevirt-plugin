import { EXAMPLE, MINUTE, TEST_NS, TEST_ROUTE_NAME } from '../../../utils/const/index';
import { checkActionMenu, nameInput } from '../../../views/actions';
import { createBtn } from '../../../views/nad';
import { row } from '../../../views/selector-common';
import { brCrumbItem, itemFilter } from '../../../views/selector-template';

describe('Check Routes page', () => {
  before(() => {
    cy.beforeSpec();
  });

  it('visit Routes page', () => {
    cy.clickNavLink(['Networking', 'Routes']);
    cy.checkTitle('Routes', MINUTE);
    cy.byButtonText('Create Route').should('be.visible');
  });

  it('create Route with form', () => {
    cy.switchProject(TEST_NS);
    cy.byButtonText('Create Route').click();
    cy.get(nameInput).clear().type(TEST_ROUTE_NAME);
    cy.byButtonText('Select a Service').click();
    cy.byButtonText(EXAMPLE).click();
    cy.byButtonText('Select target port').click();
    cy.get('#target-port').within(() => {
      cy.get('button').click();
    });
    cy.get(createBtn).click();
    cy.checkTitle(TEST_ROUTE_NAME);
    checkActionMenu('Route');
    cy.contains(brCrumbItem, 'Routes').find('a').click();
    cy.switchProject(TEST_NS);
    cy.get(itemFilter).clear().type(TEST_ROUTE_NAME);
    cy.contains(row, TEST_ROUTE_NAME).should('exist');
  });
});
