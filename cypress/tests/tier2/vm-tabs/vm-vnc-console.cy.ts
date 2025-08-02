import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import {
  gpuDescribe,
  MINUTE,
  QUICK_VM_TMPL_NAME,
  SECOND,
  TEST_NS,
  VM_STATUS,
} from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import * as vmView from '../../../views/selector-common';
import { tab } from '../../../views/tab';
import { waitForStatus } from '../../../views/vm-flow';
import { vm } from '../../../views/vm-flow';

const testVM: VirtualMachineData = {
  diskSource: DiskSource.URL_WIN2K19,
  gpu: true,
  name: 'vm-vgpu',
  namespace: TEST_NS,
  startOnCreation: true,
  template: TEMPLATE.WIN2K19,
};

describe('Test VNC console', () => {
  before(() => {
    cy.patchVM(QUICK_VM_TMPL_NAME, 'Always');
    cy.beforeSpec();
  });

  after(() => {
    cy.patchVM(QUICK_VM_TMPL_NAME, 'Halted');
  });

  it('test setup', () => {
    // cy.selectProject(TEST_NS);
    const browser = Cypress.browser.name;
    cy.task('log', browser);
    if (browser == 'electron') {
      // cy.task('log', 'electron');
      cy.visit('index.html') // yields the window object
        .its('navigator.permissions')
        // permission names taken from
        // https://w3c.github.io/permissions/#enumdef-permissionname
        .then((permissions) => permissions.query({ name: 'clipboard-read' }))
        .its('state')
        .should('equal', 'granted');
    } else if (browser == 'chrome') {
      // cy.task('log', 'chrome');
      cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
          command: 'Browser.grantPermissions',
          params: {
            origin: window.location.origin,
            // make the permission tighter by allowing the current origin only
            // like "http://localhost:56978"
            permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
          },
        }),
      );
      cy.visit('index.html') // yields the window object
        .its('navigator.permissions')
        // permission names taken from
        // https://w3c.github.io/permissions/#enumdef-permissionname
        .then((permissions) => permissions.query({ name: 'clipboard-read' }))
        .its('state')
        .should('equal', 'granted');
    }
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

  it('ID(CNV-9780) Check VNC console paste', () => {
    waitForStatus(QUICK_VM_TMPL_NAME, VM_STATUS.Running);
    cy.byLegacyTestID(QUICK_VM_TMPL_NAME).click();
    tab.navigateToConsole();
    cy.byButtonText('Guest login credentials').click();
    cy.contains('Connecting', { timeout: 3 * MINUTE }).should('not.exist');
    cy.get('canvas').should('exist');
    // cy.get('.pf-c-console').then(($div) => {
    //   if ($div.hasClass('hide')) {
    //     cy.byButtonText('Connect').click();
    //     cy.wait(5 * SECOND);
    //     // alert('hidden');
    //   }
    // });
    cy.contains(vmView.infoItem, 'User name').find('button').click({ force: true });
    cy.byButtonText('Paste').click({ force: true });
    cy.wait(5 * SECOND);
    cy.contains(vmView.infoItem, 'Password').find('button').click({ force: true });
    cy.byButtonText('Paste').click({ force: true });
  });

  it(
    'verify active user',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.wait(5 * SECOND);
      tab.navigateToOverview();
      cy.contains('Active users').scrollIntoView();
      cy.contains('Elapsed time since login', { timeout: 3 * MINUTE }).should('exist');
    },
  );
});

gpuDescribe('Test VNC switching between two displays', () => {
  before(() => {
    cy.visit('');
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('test setup', () => {
    cy.selectProject(TEST_NS);
    vm.customizeCreate(testVM, true);
  });

  it('ID(CNV-8981) Test switching between two displays', () => {
    tab.navigateToConsole();
    cy.get('button[role="tab"]')
      .contains('Screen 1')
      .parent()
      .should('have.attr', 'aria-selected')
      .and('equal', 'true');
    cy.get('button[role="tab"]').contains('Screen 2').should('exist').click();
    cy.get('button[role="tab"]')
      .contains('Screen 2')
      .parent()
      .should('have.attr', 'aria-selected')
      .and('equal', 'true');
    cy.get('button[type="button"]').contains('Send key').parent().click();
    cy.contains('Ctrl + Alt + 1').should('exist');
    cy.contains('Ctrl + Alt + 2').should('exist');
  });
});
