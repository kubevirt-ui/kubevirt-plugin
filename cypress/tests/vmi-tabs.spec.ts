import { K8S_KIND } from '../utils/const/index';
import * as tabString from '../utils/const/string';
import vmiFixture from '../fixtures/vmi-ephemeral';
import { tab } from '../views/tab';

const vmiName = 'vmi-ephemeral';
const testNS = 'default';

describe('smoke tests', () => {
  before(() => {
    cy.login();
    cy.visit('/');
    vmiFixture.metadata.namespace = testNS;
    cy.createResource(vmiFixture);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VMI, vmiName, testNS);
  });

  describe('visit vmi tabs', () => {
    it('vmi details tab is loaded', () => {
      cy.selectProject(testNS);
      cy.visitVMIs();
      cy.byLegacyTestID(vmiName).should('exist').click();
      cy.contains(tabString.VMIDetails).should('be.visible');
    });

    it('vmi yaml tab is loaded', () => {
      tab.navigateToYAML();
      cy.get('.yaml-editor').should('be.visible');
    });

    it('vmi events tab is loaded', () => {
      tab.navigateToEvents();
      cy.contains(tabString.StreamEvents).should('be.visible');
    });

    it('vmi console tab is loaded', () => {
      tab.navigateToConsole();
      cy.contains(tabString.GuestCredentials).should('be.visible');
    });

    it('vmi network tab is loaded', () => {
      tab.navigateToNetwork();
      cy.contains(tabString.PODNetworking).should('be.visible');
    });

    it('vmi disk tab is loaded', () => {
      tab.navigateToDisk();
      cy.contains(tabString.FileSystems).should('be.visible');
    });
  });
});
