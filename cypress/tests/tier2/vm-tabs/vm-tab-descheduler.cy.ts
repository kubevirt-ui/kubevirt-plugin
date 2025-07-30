import { VM_TMPL_QUICK } from '../../../utils/const/testVM';
import { deschedulerCheckBox } from '../../../views/selector-catalog';
import { descheduler, vmName } from '../../../views/selector-common';
import { tab } from '../../../views/tab';

export const verifyDeschedulerByOC = (on: boolean, ns2chk: string, vm2chk: string) => {
  cy.exec(
    `oc get -n ${ns2chk} vm ${vm2chk} -o jsonpath='{.spec.template.metadata.annotations}'`,
  ).then((result) => {
    if (on) {
      expect(result.stdout).contain('"descheduler.alpha.kubernetes.io/evict":"true"');
    } else {
      expect(result.stdout).not.contain('"descheduler.alpha.kubernetes.io/evict":"true"');
    }
  });
};

const setDescheduler = (on: boolean) => {
  cy.get(descheduler).click();
  if (on) {
    cy.get(deschedulerCheckBox).check();
  } else {
    cy.get(deschedulerCheckBox).uncheck();
  }
  cy.clickSaveBtn();
  cy.byButtonText('Save').should('not.exist');
};

describe('Test VM details tab', () => {
  before(() => {
    cy.visit('');
  });

  it(
    'visit vm list page',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
    },
  );

  // descheduler should be turned on by oc command first
  it('ID(CNV-8649) Verify VM descheduler setting', () => {
    cy.byLegacyTestID(VM_TMPL_QUICK.name).click();
    cy.contains(vmName, VM_TMPL_QUICK.name).should('be.visible');
    tab.navigateToScheduling();
    // check the edit button is disabled if VM is not migratable
    cy.get(descheduler).should('contain', 'ON').should('exist');
    verifyDeschedulerByOC(true, VM_TMPL_QUICK.namespace, VM_TMPL_QUICK.name);
    cy.get(descheduler).should('contain', 'ON');
    if (Cypress.env('STORAGE_CLASS') == 'ocs-storagecluster-ceph-rbd') {
      // modify the descheduler
      setDescheduler(false);
      verifyDeschedulerByOC(false, VM_TMPL_QUICK.namespace, VM_TMPL_QUICK.name);
    }
  });
});
