import { MINUTE } from '../../utils/const/index';
import { NAD_BRIDGE, NAD_LOCALNET, NAD_OVN } from '../../utils/const/nad';
import { Example } from '../../utils/const/string';
import { nameInput } from '../../views/actions';
import { createBtn, createNAD, deleteNAD } from '../../views/nad';
import { brCrumbItem, itemFilter } from '../../views/selector';
import { row } from '../../views/selector-common';

const checkActionMenu = (item: string) => {
  cy.byButtonText('Actions').click();
  cy.contains('button', 'Edit labels').should('exist');
  cy.contains('button', 'Edit annotations').should('exist');
  cy.contains('button', `Edit ${item}`).should('exist');
  cy.contains('button', `Delete ${item}`).should('exist');
};

const service = Example;
const route = 'auto-test-route';
const ingress = Example;
const netPolicy = 'auto-test-net-policy';
const multiPolicy = 'auto-test-multi-policy';
const ingressHeader = '#ingress-header';
const egressHeader = '#egress-header';
const ingressOff = '#denyAllIngress';
const egressOff = '#denyAllEgress';

describe('Check all Networking pages can be loaded', () => {
  before(() => {
    cy.visit('');
  });

  describe('Check Services page', () => {
    it('visit Services page', () => {
      cy.clickNavLink(['Networking', 'Services']);
      cy.checkTitle('Services', MINUTE);
      cy.byButtonText('Create Service').should('be.visible');
    });

    it('create Service with YAML', () => {
      cy.byButtonText('Create Service').click();
      cy.get(createBtn).click();
      cy.checkTitle(service);
      checkActionMenu('Service');
      cy.contains(brCrumbItem, 'Services').find('a').click();
      cy.get(itemFilter).clear().type(service);
      cy.contains(row, service).should('exist');
    });
  });

  describe('Check Routes page', () => {
    it('visit Routes page', () => {
      cy.clickNavLink(['Networking', 'Routes']);
      cy.checkTitle('Routes', MINUTE);
      cy.byButtonText('Create Route').should('be.visible');
    });

    it('create Route with form', () => {
      cy.byButtonText('Create Route').click();
      cy.get(nameInput).clear().type(route);
      cy.byButtonText('Select a Service').click();
      cy.byButtonText(service).click();
      cy.byButtonText('Select target port').click();
      cy.get('#target-port').within(() => {
        cy.get('button').click();
      });
      cy.get(createBtn).click();
      cy.checkTitle(route);
      checkActionMenu('Route');
      cy.contains(brCrumbItem, 'Routes').find('a').click();
      cy.get(itemFilter).clear().type(route);
      cy.contains(row, route).should('exist');
    });
  });

  describe('Check Ingresses page', () => {
    it('visit Ingresses page', () => {
      cy.clickNavLink(['Networking', 'Ingresses']);
      cy.checkTitle('Ingresses', MINUTE);
      cy.byButtonText('Create Ingress').should('be.visible');
    });

    it('create Ingress with YAML', () => {
      cy.byButtonText('Create Ingress').click();
      cy.get(createBtn).click();
      cy.checkTitle(ingress);
      checkActionMenu('Ingress');
      cy.contains(brCrumbItem, 'Ingresses').find('a').click();
      cy.get(itemFilter).clear().type(ingress);
      cy.contains(row, ingress).should('exist');
    });
  });

  describe('Check NetworkAttachmentDefinitions page', () => {
    it('create NAD with MAC Spoof checked', () => {
      createNAD(NAD_BRIDGE);
      checkActionMenu('NetworkAttachmentDefinition');
    });

    it('create NAD with Kubernetes localnet network', () => {
      createNAD(NAD_LOCALNET);
      checkActionMenu('NetworkAttachmentDefinition');
    });

    it('create NAD with OVN overlay network', () => {
      createNAD(NAD_OVN);
      checkActionMenu('NetworkAttachmentDefinition');
    });

    it('delete NAD', () => {
      cy.visitNAD();
      deleteNAD(NAD_BRIDGE);
      deleteNAD(NAD_LOCALNET);
    });
  });

  describe('Check NetworkPolicies page', () => {
    it('visit NetworkPolicies page', () => {
      cy.clickNavLink(['Networking', 'NetworkPolicies']);
      cy.checkTitle('NetworkPolicies', MINUTE);
      cy.byButtonText('Create NetworkPolicy').should('be.visible');
    });

    it('create NetworkPolicy with form', () => {
      cy.byButtonText('Create NetworkPolicy').click();
      cy.get(nameInput).clear().type(netPolicy);
      cy.get(ingressHeader).should('exist');
      cy.get(ingressOff).check();
      cy.get(ingressHeader).should('not.exist');
      cy.get(egressHeader).should('exist');
      cy.get(egressOff).check();
      cy.get(egressHeader).should('not.exist');
      cy.get(createBtn).click();
      cy.screenshot();
      cy.checkTitle(netPolicy);
      checkActionMenu('NetworkPolicy');
      cy.contains(brCrumbItem, 'NetworkPolicy').find('a').click();
      cy.get(itemFilter).clear().type(netPolicy);
      cy.contains(row, netPolicy).should('exist');
    });

    it('create MultiNetworkPolicy with form', () => {
      cy.byButtonText('MultiNetworkPolicies').click();
      cy.byButtonText('Enable MultiNetworkPolicies').click();
      cy.byButtonText('try again').click();
      cy.byButtonText('Create MultiNetworkPolicy').click();
      cy.get(nameInput).clear().type(multiPolicy);
      cy.get('input[placeholder="Select one or more NetworkAttachmentDefinitions"]').click();
      cy.byButtonText(NAD_OVN.name).click();
      cy.get(ingressHeader).should('exist');
      cy.get(ingressOff).check();
      cy.get(ingressHeader).should('not.exist');
      cy.get(egressHeader).should('exist');
      cy.get(egressOff).check();
      cy.get(egressHeader).should('not.exist');
      cy.get(createBtn).click();
      cy.screenshot();
      cy.checkSubTitle(multiPolicy);
      checkActionMenu('MultiNetworkPolicy');
      cy.contains(brCrumbItem, 'MultiNetworkPolicy').find('a').click();
      cy.get(itemFilter).clear().type(multiPolicy);
      cy.contains(row, multiPolicy).should('exist');
    });
  });
});
