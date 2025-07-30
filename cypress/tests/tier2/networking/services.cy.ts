import { EXAMPLE, MINUTE, TEST_NS } from '../../../utils/const/index';
import { checkActionMenu } from '../../../views/actions';
import { createBtn } from '../../../views/nad';
import { row } from '../../../views/selector-common';
import { brCrumbItem, itemFilter } from '../../../views/selector-template';

describe('Check Services page', () => {
  before(() => {
    cy.beforeSpec();
  });

  it('visit Services page', () => {
    cy.clickNavLink(['Networking', 'Services']);
    cy.checkTitle('Services', MINUTE);
    cy.byButtonText('Create Service').should('be.visible');
  });

  it('create Service with YAML', () => {
    cy.switchProject(TEST_NS);
    cy.byButtonText('Create Service').click();
    cy.get(createBtn).click();
    cy.checkTitle(EXAMPLE);
    checkActionMenu('Service');
    cy.contains(brCrumbItem, 'Services').find('a').click();
    cy.switchProject(TEST_NS);
    cy.get(itemFilter).type(EXAMPLE);
    cy.contains(row, EXAMPLE).should('exist');
  });
});
