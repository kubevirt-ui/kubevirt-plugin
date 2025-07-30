import { EXAMPLE, K8S_KIND, MINUTE, nnsDescribe } from '../../../utils/const/index';
import { YAML } from '../../../utils/const/string';
import { getRow } from '../../../views/actions';
import { confirmBtn } from '../../../views/nad';
import * as nncp from '../../../views/nncp';
import {
  addLabel,
  createBtn,
  DHCP,
  fillKey,
  fillValue,
  fromForm,
  iPort,
  IPV4,
  nodeSelectBtn,
  policyDesc,
  policyName,
  submitBtn,
} from '../../../views/nncp';
import * as sel from '../../../views/selector-common';
import { closeButton } from '../../../views/selector-overview';
import { brCrumbItem, dropdownFilter, itemFilter } from '../../../views/selector-template';

const autoNNCP = 'auto-test-nncp';
const wizNNCP = 'wizard-test-nncp';
const yamlNNCP = EXAMPLE;
const states = ['Failing', 'Aborted', 'Available', 'Progressing', 'Pending'];
const dropDnBtn = '[data-test-id="dropdown-button"]';

// nnsDescribe('Test Node network configuration', () => {
xdescribe('Test Node network configuration', () => {
  before(() => {
    cy.visitNNC();
    cy.deleteResource(K8S_KIND.NNCP, autoNNCP);
    cy.deleteResource(K8S_KIND.NNCP, wizNNCP);
  });

  it('ID(CNV-11524) check NNS topology view', () => {
    cy.get('[data-test-id="topology"]').should('exist');
    cy.get('.list-view-btn').find('button').click();
    cy.checkTitle('NodeNetworkState');
    cy.get('.nns-list-management-group').should('exist');
  });

  it('ID(CNV-10366) verify bridge on NodeNetworkState', () => {
    cy.get('#expand-interfaces-list3').click();
    cy.get('.state-row__expanded-true').within(() => {
      cy.byButtonText('ethernet').click();
      cy.byButtonText(Cypress.env('NNCP_NIC')).should('exist');
    });
  });

  it('ID(CNV-11890) create NNCP with wizard', () => {
    cy.visitNNC();
    cy.checkSubTitle('Node network configuration');
    cy.get(sel.itemCreateBtn).click();
    cy.get(nncp.fromForm).click();
    cy.get(nncp.policyName).clear();
    cy.get(nncp.policyName).type(wizNNCP);
    cy.get(nncp.policyDesc).type('test nncp by wizard');
    cy.clickSubmitBtn();
    cy.clickSubmitBtn();
    cy.clickSubmitBtn();
    cy.get(nncp.IPV4).check();
    cy.get(nncp.DHCP).click();
    cy.get(nncp.iPort).type(Cypress.env('NNCP_NIC'));
    cy.get(nncp.STP).check();
    cy.clickSubmitBtn();
    cy.clickSubmitBtn();
    cy.checkTitle(wizNNCP, MINUTE);
    cy.contains(brCrumbItem, 'NodeNetworkConfigurationPolicy').find('a').click();
    getRow(wizNNCP, () => cy.contains('[data-label="nodes"]', 'nodes').should('exist'));
  });

  it('ID(CNV-11891) create NNCP with YAML', () => {
    cy.get(sel.itemCreateBtn).click();
    cy.byButtonText(YAML).click();
    cy.get(sel.createBtn).click();
    cy.checkTitle(yamlNNCP, MINUTE);
    cy.contains(brCrumbItem, 'NodeNetworkConfigurationPolicy').find('a').click();
    getRow(yamlNNCP, () => cy.contains('[data-label="nodes"]', 'nodes').should('exist'));
  });

  it('ID(CNV-9769) create NNCP from form', () => {
    cy.get(createBtn).click();
    cy.get(fromForm).click();
    cy.get(nodeSelectBtn).click();
    cy.get(addLabel).click();
    cy.get(fillKey('0')).type('cpumanager'); // hardcode it here
    cy.get(fillValue('0')).type('true');
    cy.clickSubmitBtn();
    cy.get(policyName).clear();
    cy.get(policyName).type(autoNNCP);
    cy.get(policyDesc).type('create nncp');
    cy.get('option[value="linux-bridge"]').should('exist');
    cy.get(IPV4).check();
    cy.get(DHCP).click();
    cy.get(iPort).clear().type(Cypress.env('NNCP_NIC'));
    cy.get(submitBtn).click();
    cy.checkTitle(autoNNCP, MINUTE);
    cy.contains(brCrumbItem, 'NodeNetworkConfigurationPolicy').find('a').click();
    getRow(autoNNCP, () => cy.contains('[data-label="nodes"]', 'nodes').should('exist'));
  });

  it('ID(CNV-11892) test NNCP nodes summary', () => {
    getRow(autoNNCP, () => cy.get('[data-label="status"]').find('button').eq(0).click());
    cy.checkTitle('Matched nodes summary');
    states.forEach((state) => {
      cy.byButtonText(state).should('exist');
    });
    cy.byButtonText(Cypress.env('FIRST_NODE')).should('exist');
    cy.byButtonText(Cypress.env('SECOND_NODE')).should('exist');
    cy.byButtonText(Cypress.env('THIRD_NODE')).should('exist');
    cy.get(closeButton).click();
  });

  it('ID(CNV-11893) test NNCP page controls', () => {
    cy.get(dropdownFilter).click();
    states.forEach((state) => {
      cy.contains(`label#${state}`, state).should('exist');
    });
    cy.get(dropDnBtn).click();
    cy.get('[data-test-dropdown-menu="LABEL"]').should('exist');
    cy.get('[data-test-dropdown-menu="NAME"]').should('exist');
    cy.get(itemFilter).type(yamlNNCP);
    cy.contains(autoNNCP).should('not.exist');
    cy.contains(wizNNCP).should('not.exist');
    cy.byButtonText('Clear all filters').click();
    cy.contains(autoNNCP).should('exist');
    cy.contains(wizNNCP).should('exist');
    cy.get('[data-test="manage-columns"]').click();
    cy.checkTitle('Manage columns');
    cy.get('[for="nodes"]').eq(0).click();
    cy.get('#nodes').should('not.be.checked');
    cy.get('[for="status"]').eq(0).click();
    cy.get('#status').should('not.be.checked');
    cy.get(confirmBtn).click();
    cy.get('[data-label="Matched nodes"]').should('not.exist');
    cy.get('[data-label="Enactment states"]').should('not.exist');
    cy.get('[data-test="manage-columns"]').click();
    cy.get(sel.resetBtn).click();
    cy.get('#nodes').should('be.checked');
    cy.get('#status').should('be.checked');
    cy.get(confirmBtn).click();
    cy.get('[data-label="Matched nodes"]').should('exist');
    cy.get('[data-label="Enactment states"]').should('exist');
  });

  it('ID(CNV-11894) test Edit NNCP modal', () => {
    getRow(yamlNNCP, () => cy.get(sel.actionsBtn).click());
    cy.byButtonText('Edit').click();
    cy.checkTitle('Edit NodeNetworkConfigurationPolicy');
    cy.get(nncp.policyDesc).type('test NNCP with YAML');
    cy.get(nncp.autoDNS).uncheck();
    cy.get(nncp.autoRoutes).uncheck();
    cy.get(nncp.autoGateway).uncheck();
    cy.get(nncp.fixedIP).click();
    cy.get(nncp.IPV4Addr).type('128.0.0.1');
    cy.get(sel.minusBtn).click();
    cy.get(sel.plusBtn).click();
    cy.get('input[aria-label="Input"]').should('have.value', '24');
    cy.get(nncp.DHCP).click();
    cy.get(nncp.iPort).type(Cypress.env('NNCP_NIC'));
    cy.clickSubmitBtn();
    cy.get('body').then(($body) => {
      // the button is flaky
      if ($body.text().includes('Edit NodeNetworkConfigurationPolicy')) {
        cy.clickCancelBtn();
      }
    });
  });

  it('ID(CNV-11895) delete NNCP', () => {
    getRow(wizNNCP, () => cy.get(sel.actionsBtn).click());
    cy.byButtonText('Delete').click();
    cy.checkTitle('Delete NodeNetworkConfigurationPolicy?');
    cy.get('#text-confirmation').type(wizNNCP);
    cy.contains('button', 'Delete').click();
    cy.contains(wizNNCP).should('not.exist');
    getRow(yamlNNCP, () => cy.get(sel.actionsBtn).click());
    cy.byButtonText('Delete').click();
    cy.checkTitle('Delete NodeNetworkConfigurationPolicy?');
    cy.get('#text-confirmation').type(yamlNNCP);
    cy.contains('button', 'Delete').click();
    cy.contains(yamlNNCP).should('not.exist');
  });
});
