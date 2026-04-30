import { ALL_PROJ_NS } from '../../utils/const/index';
import { TEMPLATE } from '../../utils/const/template';
import * as tView from '../../views/selector-template';

describe('Test template list page', () => {
  beforeEach(() => {
    cy.beforeSpec();
    cy.visitTemplatesVirt();
  });

  after(() => {
    cy.toggleVMTemplatesFeature(false);
  });

  it('filter template by name', () => {
    cy.switchProject(ALL_PROJ_NS);
    cy.get(tView.itemFilter).type(TEMPLATE.CENTOSSTREAM9.metadataName);
    cy.byLegacyTestID(TEMPLATE.CENTOSSTREAM9.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.CENTOSSTREAM10.metadataName).should('not.exist');
  });

  it('Type filter should not be visible when VM templates feature is disabled', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="templates"]').should('not.exist');
    cy.get('[data-test-row-filter="vm-templates"]').should('not.exist');
  });

  it('Type filter should work after enabling VM templates feature', () => {
    cy.toggleVMTemplatesFeature(true);
    cy.visitTemplatesVirt();
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="templates"]').click();
    cy.get(tView.dropdownFilter).click();
    cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.FEDORA.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.WIN10.metadataName).should('exist');
  });

  it('filter templates by OS', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="windows"]').click();
    cy.get(tView.dropdownFilter).click();
    cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.RHEL8.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.RHEL7.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.WIN2K22.metadataName).should('exist');
  });

  it('filter templates by Provider', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="Other"]').click();
    cy.get(tView.dropdownFilter).click();
    cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.RHEL8.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.RHEL7.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.WIN10.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.WIN2K19.metadataName).should('not.exist');
  });

  it('template without auto-bootsource should have no available label', () => {
    cy.get(tView.itemFilter).type('windows');
    cy.contains('Source available').should('not.exist');
  });

  it('filter templates by OS and Provider combined', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="Red Hat"]').click();
    cy.get('[data-test-row-filter="windows"]').click();
    cy.get(tView.dropdownFilter).click();
    cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.FEDORA.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.WIN10.metadataName).should('exist');
  });
});
