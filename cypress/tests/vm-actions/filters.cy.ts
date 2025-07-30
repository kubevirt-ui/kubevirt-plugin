import { VirtualMachineData } from '../../types/vm';
import { TEST_NS } from '../../utils/const/index';
import { VM_IT_CUST, VM_TMPL_CUST } from '../../utils/const/testVM';
import { menuToggleText } from '../../views/selector-common';
import { filterByName } from '../../views/selector-instance';
import { getRow, vm } from '../../views/vm-flow';

describe('Filter VM on list page', () => {
  before(() => {
    cy.beforeSpec();
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitCatalogVirt();
      cy.visitVMsVirt();
    },
  );

  it('ID(CNV-8982) Filter stopped VMs', () => {
    cy.contains('Filter').click();
    cy.get('[data-test-row-filter="Stopped"]').find('input[type="checkbox"]').check();
    cy.wait(3000);
    cy.byLegacyTestID(VM_IT_CUST.name).should('exist');
    cy.wait(1000);
    cy.contains(menuToggleText, 'Actions').click();
    cy.cotains('Clear all filters').click();
  });

  it('ID(CNV-8983) Filter VMs by template', () => {
    cy.contains('Filter').click();
    cy.get(`[data-test-row-filter="${VM_TMPL_CUST.template.metadataName}"]`)
      .find('input[type="checkbox"]')
      .check();
    cy.wait(3000);
    cy.byLegacyTestID(VM_IT_CUST.name).should('not.exist');
    cy.byLegacyTestID(VM_TMPL_CUST.name).should('exist');
    cy.wait(1000);
    cy.contains(menuToggleText, 'Actions').click();
    cy.cotains('Clear all filters').click();
  });

  it('ID(CNV-8983) Filter VMs by instanceType', () => {
    cy.contains('Filter').click();
    cy.get('[data-test-row-filter="u1"]').scrollIntoView();
    cy.get('[data-test-row-filter="u1"]').find('input[type="checkbox"]').check();
    cy.wait(3000);
    cy.byLegacyTestID(VM_IT_CUST.name).should('exist');
    cy.byLegacyTestID(VM_TMPL_CUST.name).should('not.exist');
    cy.wait(1000);
    cy.contains(menuToggleText, 'Actions').click();
    cy.cotains('Clear all filters').click();
  });

  it('ID(CNV-10785) Filter VMs by IP', () => {
    cy.contains('Filter').click();
    cy.byButtonText('Name').click();
    cy.byButtonText('IP Address').click();
    cy.get(filterByName).clear().type(`10{enter}`);
    cy.contains(menuToggleText, 'Actions').click();
    cy.cotains('Clear all filters').click();
  });
});
