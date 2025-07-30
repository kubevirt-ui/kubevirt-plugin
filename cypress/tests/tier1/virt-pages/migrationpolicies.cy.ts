import * as ind from '../../../utils/const/index';
import * as str from '../../../utils/const/string';
import { getRow, tabModal } from '../../../views/actions';
import * as sel from '../../../views/selector-common';

export const deleteMP = (migrationPolicyName: string) => {
  getRow(migrationPolicyName, () => cy.get(sel.actionsBtn).click());
  cy.byLegacyTestID(sel.delMP).click();
  cy.get(tabModal).within(() => {
    cy.contains('strong', migrationPolicyName).should('exist');
    cy.byButtonText('Delete').click();
  });
};

ind.adminOnlyDescribe('Test Virtualization MigrationPolicies page', () => {
  before(() => {
    cy.beforeSpec();
    cy.deleteResource(ind.K8S_KIND.MP, ind.YAML_DS_NAME, ind.TEST_NS);
    cy.deleteResource(ind.K8S_KIND.MP, ind.POLICY_NAME, ind.TEST_NS);
  });

  after(() => {
    cy.deleteResource(ind.K8S_KIND.MP, ind.YAML_DS_NAME, ind.TEST_NS);
    cy.deleteResource(ind.K8S_KIND.MP, ind.POLICY_NAME, ind.TEST_NS);
  });

  it('ID(CNV-9384) Create MigrationPolicy from YAML', () => {
    cy.visitMPsVirt();
    cy.wait(5000);
    cy.get(sel.itemCreateBtn).click();
    cy.byButtonText(str.withYAML).click();
    // cy.get(sel.yamlEditor).type(`{ctrl}a{del}`).type(MP_YAML);
    cy.get(sel.createBtn).click();
    cy.contains('.pf-v6-c-breadcrumb__item', 'MigrationPolicies').click();
  });

  it('ID(CNV-9385) Create MigrationPolicy with form', () => {
    cy.get(sel.itemCreateBtn).click();
    cy.byButtonText(str.withForm).click();
    cy.contains(sel.formGroup, `${ind.K8S_KIND.MP} name`).within(() => {
      cy.get('input').clear().type(ind.POLICY_NAME);
    });
    cy.byButtonText('Create').click();
    cy.wait(3000);
    cy.contains(ind.POLICY_NAME).should('exist');
    cy.contains('.pf-v6-c-breadcrumb__item', 'MigrationPolicies').click();
  });

  // disable because of flakiness
  xit('ID(CNV-9387) Edit MigrationPolicy', () => {
    getRow(ind.POLICY_NAME, () => cy.get(sel.actionsBtn).click());
    cy.get('[data-test-id="mp-action-edit"]').click();
    cy.byButtonText(str.addConfiguration).click();
    cy.contains('Auto converge').click();
    cy.byLegacyTestID('allowAutoConverge-selected').should('exist');
    cy.byButtonText(str.addConfiguration).click();
    cy.contains('Post-copy').click();
    cy.byLegacyTestID('allowPostCopy-selected').should('exist');
    cy.byButtonText(str.addConfiguration).click();
    cy.contains('Completion timeout').click();
    cy.byLegacyTestID('completionTimeoutPerGiB-selected').within(() => {
      cy.get('[aria-label="Increment"]').click();
    });
    cy.byButtonText(str.addConfiguration).click();
    cy.contains('Bandwidth per migration').click();
    cy.byLegacyTestID('bandwidthPerMigration-selected').within(() => {
      cy.get('[aria-label="Increment"]').click();
      cy.byButtonText('MiB').click();
      cy.byButtonText('GiB').click();
    });
    cy.clickSaveBtn();
    getRow(ind.POLICY_NAME, () => {
      cy.contains('[data-label="bandwidth"]', '1 GiB').should('exist');
      cy.contains('[data-label="auto-converge"]', 'No').should('exist');
      cy.contains('[data-label="post-copy"]', 'No').should('exist');
      cy.contains('[data-label="completion-timeout"]', '1 sec').should('exist');
    });
  });

  it('ID(CNV-9388) Delete MigrationPolicy', () => {
    deleteMP(ind.POLICY_NAME);
    deleteMP(ind.YAML_MP_NAME);
  });
});
