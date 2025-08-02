import { EXAMPLE, MINUTE, TEST_NS } from '../../../utils/const/index';
import { checkActionMenu } from '../../../views/actions';
import { createBtn } from '../../../views/nad';
import { row } from '../../../views/selector-common';
import { brCrumbItem, itemFilter } from '../../../views/selector-template';

describe('Check Ingresses page', () => {
  before(() => {
    cy.beforeSpec();
  });

  it('visit Ingresses page', () => {
    cy.clickNavLink(['Networking', 'Ingresses']);
    cy.checkTitle('Ingresses', MINUTE);
    cy.byButtonText('Create Ingress').should('be.visible');
  });

  it('create Ingress with YAML', () => {
    cy.switchProject(TEST_NS);
    cy.byButtonText('Create Ingress').click();
    cy.get(createBtn).click();
    cy.checkTitle(EXAMPLE);
    checkActionMenu('Ingress');
    cy.contains(brCrumbItem, 'Ingresses').find('a').click();
    cy.switchProject(TEST_NS);
    cy.get(itemFilter).clear().type(EXAMPLE);
    cy.contains(row, EXAMPLE).should('exist');
  });
});
