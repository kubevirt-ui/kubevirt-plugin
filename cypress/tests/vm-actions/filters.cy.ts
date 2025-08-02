import { VirtualMachineData } from '../../types/vm';
import { TEST_NS } from '../../utils/const/index';
import { VM_IT_CUST } from '../../utils/const/testVM';
import { filterByName } from '../../views/selector-instance';
import { getRow, vm } from '../../views/vm-flow';

const VM_FROM_IT: VirtualMachineData = {
  name: 'vm-from-it',
  namespace: TEST_NS,
  startOnCreation: false,
  volume: 'fedora',
};

describe('Filter VM on list page', () => {
  before(() => {
    cy.visit('', { timeout: 90000 });
    cy.switchToVirt();
  });

  after(() => {
    cy.deleteVM([VM_FROM_IT]);
  });

  it('create test vm from instanceType', () => {
    vm.instanceCreate(VM_FROM_IT);
  });

  it(
    'visit vm list page',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.navigateToVMs();
    },
  );

  it('ID(CNV-8982) Filter stopped VMs', () => {
    cy.contains('Filter').click();
    cy.get('[data-test-row-filter="Stopped"]').find('input[type="checkbox"]').check();
    cy.wait(6000);
    cy.byLegacyTestID(VM_FROM_IT.name).should('exist');
    cy.wait(1000);
  });

  it('ID(CNV-8983) Filter VMs by template', () => {
    cy.get('[data-test-row-filter="rhel9-server-small"]').find('input[type="checkbox"]').check();
    cy.wait(6000);
    cy.byLegacyTestID(VM_IT_CUST.name).should('exist');
    cy.wait(1000);
  });

  it('ID(CNV-8983) Filter VMs by instanceType', () => {
    cy.get('[data-test-row-filter="u1"]').scrollIntoView();
    cy.get('[data-test-row-filter="u1"]').find('input[type="checkbox"]').check();
    cy.wait(6000);
    cy.byLegacyTestID(VM_IT_CUST.name).should('not.exist');
    cy.byLegacyTestID(VM_FROM_IT.name).should('exist');
    cy.wait(1000);
  });

  it('ID(CNV-10785) Filter VMs by IP', () => {
    cy.byButtonText('Name').click();
    cy.byButtonText('IP Address').click();
    cy.get(filterByName).clear().type(`10{enter}`);
    cy.wait(5000);
    cy.byLegacyTestID(VM_FROM_IT.name).should('not.exist');
  });
});
