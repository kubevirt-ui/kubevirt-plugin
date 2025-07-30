import { DEFAULT_VM_NAME } from '../../utils/const/index';
import { VM_IT_CUST, VM_TMPL_CUST } from '../../utils/const/testVM';
import * as vma from '../../views/actions';
import { action } from '../../views/actions';
import * as vmView from '../../views/selector-common';
import { tab } from '../../views/tab';
import { getRow } from '../../views/vm-flow';

describe('Test VM actions on list page', () => {
  before(() => {
    cy.visit('', { timeout: 90000 });
    cy.switchToVirt();
  });

  after(() => {
    cy.stopVM([DEFAULT_VM_NAME, VM_IT_CUST.name, VM_TMPL_CUST.name]);
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitCatalog();
      cy.visitVMs();
      cy.byTestID(DEFAULT_VM_NAME).should('exist');
    },
  );

  it('ID(CNV-11803) start all VMs at once', () => {
    cy.get(vmView.selectPage).check();
    cy.contains(vmView.menuToggleText, 'Actions').click();
    cy.get(vma.ActionStart).click();
  });

  it(
    'verify all VMs are started',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.exec(`oc wait --for=condition=ready vm/${DEFAULT_VM_NAME} --timeout=30s`, {
        timeout: 30000,
      });
      cy.contains('.pf-v6-c-helper-text__item-text', 'Stopped').should('not.exist');
    },
  );

  it('ID(CNV-11804) stop all VMs at once', () => {
    cy.contains(vmView.menuToggleText, 'Actions').click();
    cy.get('body').then(($body) => {
      if ($body.find(vma.ActionStop).length > 0) {
        cy.get(vma.ActionStop).click();
        cy.get(vmView.confirmBtn).click();
      } else {
        cy.stopVM([DEFAULT_VM_NAME, VM_IT_CUST.name, VM_TMPL_CUST.name]);
      }
    });
  });

  it(
    'verify all VMs are stopped',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.contains('.pf-v6-c-helper-text__item-text', 'Running').should('not.exist');
    },
  );

  it('ID(CNV-8969) Test actions while VM is stopped', () => {
    // stopped state
    getRow(DEFAULT_VM_NAME, () => cy.get(vma.vmActions).find('button').click());
    cy.get('body').then(($body) => {
      if ($body.find(vma.DELETE).length > 0) {
        cy.byLegacyTestID(vma.STOP).should('not.exist');
        cy.byLegacyTestID(vma.RESTART).should('have.class', 'pf-m-disabled');
        cy.byLegacyTestID(vma.PAUSE).should('have.class', 'pf-m-disabled');
        cy.byLegacyTestID(vma.CLONE).should('not.be.disabled');
        cy.byLegacyTestID(vma.START).should('not.be.disabled');
        cy.byLegacyTestID(vma.DELETE).should('not.be.disabled');
        cy.byButtonText('Migration').click();
        cy.byLegacyTestID(vma.MIGRATE_COMPUTE).should('have.class', 'pf-m-disabled');
      }
    });
  });

  it('start the VM', () => {
    cy.startVM([DEFAULT_VM_NAME]);
  });

  it('ID(CNV-8969) Test actions while VM is running', () => {
    // running state
    getRow(DEFAULT_VM_NAME, () => cy.get(vma.vmActions).find('button').click());
    cy.get('body').then(($body) => {
      if ($body.find(vma.DELETE).length > 0) {
        cy.byLegacyTestID(vma.START).should('not.exist');
        cy.byLegacyTestID(vma.RESTART).should('not.be.disabled');
        cy.byLegacyTestID(vma.PAUSE).should('not.be.disabled');
        cy.byLegacyTestID(vma.CLONE).should('not.be.disabled');
        cy.byLegacyTestID(vma.DELETE).should('be.disabled');
        cy.byButtonText('Migration').click();
        cy.byLegacyTestID(vma.MIGRATE_COMPUTE).should('have.class', 'pf-m-disabled');
      }
    });
  });

  it('stop the VM', () => {
    cy.stopVM([DEFAULT_VM_NAME]);
    cy.wait(10000);
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitCatalog();
      cy.visitVMs();
    },
  );

  it('ID(CNV-) Take snapshot from list page', () => {
    getRow(DEFAULT_VM_NAME, () => cy.get(vma.vmActions).find('button').click());
    cy.get('body').then(($body) => {
      if ($body.find(vma.DELETE).length > 0) {
        cy.byLegacyTestID(vma.SNAPSHOT).click();
        cy.clickSaveBtn();
        cy.byLegacyTestID(DEFAULT_VM_NAME).click();
        tab.navigateToSnapshots();
        cy.contains(`${DEFAULT_VM_NAME}-snapshot`).should('exist');
      }
    });
  });
});
