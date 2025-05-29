import { ALL_PROJ_NS } from '../../utils/const/index';
import { TEMPLATE } from '../../utils/const/template';
import * as tView from '../../views/selector-template';

describe('Test template list page', () => {
  beforeEach(() => {
    cy.beforeSpec();
    cy.visitTemplatesVirt();
  });

  it('filter template by name', () => {
    cy.switchProject(ALL_PROJ_NS);
    cy.get(tView.itemFilter).type(TEMPLATE.CENTOSSTREAM9.metadataName);
    cy.byLegacyTestID(TEMPLATE.CENTOSSTREAM9.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.CENTOSSTREAM10.metadataName).should('not.exist');
  });

  it('filter default templates', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="is-default"]')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.FEDORA.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.WIN10.metadataName).should('exist');
  });

  it('filter templates by OS', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="windows"]')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.byLegacyTestID(TEMPLATE.RHEL9.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.RHEL8.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.RHEL7.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.WIN2K22.metadataName).should('exist');
  });

  it('filter templates by Provider', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="Other"]').find('input[type="checkbox"]').check({ force: true });
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

  it('filter templates by boot source', () => {
    cy.get(tView.dropdownFilter).click();
    cy.get('[data-test-row-filter="hide-deprecated-templates"]')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('[data-test-row-filter="is-default"]')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get('[data-test-row-filter="available"]')
      .find('input[type="checkbox"]')
      .check({ force: true });
    cy.get(tView.dropdownFilter).click();
    cy.byLegacyTestID(TEMPLATE.CENTOSSTREAM9.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.FEDORA.metadataName).should('exist');
    cy.byLegacyTestID(TEMPLATE.RHEL7.metadataName).should('not.exist');
    cy.byLegacyTestID(TEMPLATE.WIN10.metadataName).should('not.exist');
  });
});
