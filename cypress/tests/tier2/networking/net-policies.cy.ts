import {
  adminOnlyIT,
  MINUTE,
  TEST_MULTI_NAME,
  TEST_NS,
  TEST_POL_NAME,
} from '../../../utils/const/index';
import { checkActionMenu, nameInput } from '../../../views/actions';
import { createBtn } from '../../../views/nad';
import { addBtn } from '../../../views/selector-catalog';
import {
  egressHeader,
  egressOff,
  ingressHeader,
  ingressOff,
  row,
} from '../../../views/selector-common';
import { brCrumbItem, itemFilter } from '../../../views/selector-template';

const denyTraffic = () => {
  cy.get(ingressOff).check();
  cy.get(ingressHeader).should('not.exist');
  cy.get(egressOff).check();
  cy.get(egressHeader).should('not.exist');
};

describe('Check NetworkPolicies page', () => {
  before(() => {
    cy.beforeSpec();
  });

  it('visit NetworkPolicies page', () => {
    cy.clickNavLink(['Networking', 'NetworkPolicies']);
    cy.checkTitle('NetworkPolicies', MINUTE);
    cy.byButtonText('Create NetworkPolicy').should('be.visible');
  });

  it('create NetworkPolicy with form', () => {
    cy.switchProject(TEST_NS);
    cy.byButtonText('Create NetworkPolicy').click();
    // this is required due to flakiness in automated testing
    cy.switchProject(TEST_NS);
    cy.byButtonText('Create NetworkPolicy').click();
    cy.get('input#form').check();
    cy.get(nameInput).clear();
    cy.get(nameInput).type(TEST_POL_NAME);
    denyTraffic();
    // cy.byTestID('yaml-view-input').check();
    cy.clickSubmitBtn();
    cy.checkTitle(TEST_POL_NAME);
    checkActionMenu('NetworkPolicy');
    cy.contains(brCrumbItem, 'NetworkPolicy').find('a').click();
    cy.switchProject(TEST_NS);
    cy.get(itemFilter).type(TEST_POL_NAME);
    cy.contains(row, TEST_POL_NAME).should('exist');
  });

  // adminOnlyIT('create MultiNetworkPolicy with form', () => {
  xit('create MultiNetworkPolicy with form', () => {
    cy.byButtonText('MultiNetworkPolicies').click();
    cy.get('body').then(($body) => {
      if ($body.text().includes('Enable MultiNetworkPolicies')) {
        cy.byButtonText('Enable MultiNetworkPolicies').click();
        cy.byButtonText('try again').click();
        cy.get(addBtn).should('exist');
      }
    });
    cy.switchProject(TEST_NS);
    cy.get(addBtn).click();
    cy.get(nameInput).clear();
    cy.get(nameInput).type(TEST_MULTI_NAME);
    cy.get('input[aria-label="Type to filter"]').click();
    cy.get('ul#select-multi-typeahead-listbox').within(() => {
      cy.get('button').eq(0).click();
    });
    denyTraffic();
    cy.get(createBtn).click();
    cy.checkTitle(TEST_MULTI_NAME);
    checkActionMenu('MultiNetworkPolicy');
    cy.contains(brCrumbItem, 'MultiNetworkPolicy').find('a').click();
    cy.switchProject(TEST_NS);
    cy.get(itemFilter).type(TEST_MULTI_NAME);
    cy.contains(row, TEST_MULTI_NAME).should('exist');
  });
});
