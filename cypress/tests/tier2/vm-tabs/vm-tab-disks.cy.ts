import { blankDisk } from '../../../utils/const/diskSource';
import {
  K8S_KIND,
  MINUTE,
  QUAY_UL_PASSWD,
  QUAY_UL_URL,
  QUAY_UL_USER,
  SECOND,
  TEST_NS,
  VM_STATUS,
} from '../../../utils/const/index';
import { pending, winDriversDisk } from '../../../utils/const/string';
import { VM_IT_QUICK } from '../../../utils/const/testVM';
import { action, getRow, nameInput } from '../../../views/actions';
import { addDisk } from '../../../views/modals';
import { winDrivers } from '../../../views/selector-catalog';
import * as sel from '../../../views/selector-common';
import { pvcCheckbox } from '../../../views/selector-instance';
import { closeButton, resItem } from '../../../views/selector-overview';
import { tab } from '../../../views/tab';
import { waitForStatus } from '../../../views/vm-flow';

const diskName = blankDisk.name;
const persHotPlugLbl = 'Persistent Hotplug';
const AutoDetachLbl = 'AutoDetach Hotplug';
const bootVol = `${diskName}-bootvol`;

describe('Test VM Disks tab', () => {
  before(() => {
    cy.deleteResource(K8S_KIND.DV, bootVol, TEST_NS);
    cy.patchVM(VM_IT_QUICK.name, 'Always');
    cy.beforeSpec();
  });

  after(() => {
    cy.patchVM(VM_IT_QUICK.name, 'Halted');
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

  it('test setup', () => {
    cy.contains(sel.treeNode, TEST_NS).click();
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Running);
    cy.byLegacyTestID(VM_IT_QUICK.name).click();
    tab.navigateToConfigurationStorage();
    addDisk(blankDisk);
    cy.wait(30 * SECOND);
  });

  it(
    'click kebab button',
    {
      retries: {
        openMode: 0,
        runMode: 6,
      },
    },
    () => {
      cy.contains(sel.row, diskName).within(() => {
        cy.contains(sel.labelContent, persHotPlugLbl).should('exist');
        cy.get(sel.actionsBtn).click();
      });
      cy.byButtonText('Make persistent').click();
    },
  );

  it('ID(CNV-9806) Make hot plugged disk persistent', () => {
    cy.contains('Make persistent?').should('exist');
    cy.contains('strong', diskName).should('exist');
    cy.clickSaveBtn();
    cy.contains(pending, { timeout: MINUTE }).should('exist');
    action.restart(VM_IT_QUICK.name, false);
    // waitForStatus(VM_IT_QUICK.name, VM_STATUS.Starting, false);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Running, false);
    cy.contains(sel.row, diskName).within(() => {
      cy.contains(sel.labelContent, persHotPlugLbl).should('not.exist');
    });
  });

  it('ID(CNV-9830) Mount windows driver on disk tab', () => {
    cy.get(winDrivers, { timeout: MINUTE }).check();
    cy.wait(5 * SECOND);
    cy.contains(sel.row, winDriversDisk).should('exist');
    cy.contains(pending, { timeout: MINUTE }).should('exist');
    cy.get(winDrivers).uncheck();
    cy.wait(5 * SECOND);
    cy.contains(sel.row, winDriversDisk, { timeout: MINUTE }).should('not.exist');
  });

  it(
    'click kebab button',
    {
      retries: {
        openMode: 0,
        runMode: 6,
      },
    },
    () => {
      getRow(diskName, () => cy.get(sel.actionsBtn).click());
      cy.byButtonText('Save as bootable volume').click();
    },
  );

  it('ID(CNV-11616) Create Bootable volume from added disk', () => {
    cy.checkTitle('Save as bootable volume');
    cy.get(nameInput).clear().type(bootVol);
    cy.clickSaveBtn();
    cy.checkTitle(bootVol);
    cy.contains(resItem, bootVol).should('exist');
  });

  // https://issues.redhat.com/browse/CNV-59578
  xit('ID(CNV-11747) Upload Bootable volume to registry', () => {
    cy.exec(`oc delete pods -n ${TEST_NS} --all`, { failOnNonZeroExit: false });
    cy.checkTitle(bootVol);
    cy.byButtonText('Actions').click();
    cy.byButtonText('Upload to registry').click();
    cy.checkTitle('Upload to registry');
    cy.contains('remove any private information from the image').should('exist');
    cy.get('#registryName').clear().type(`${diskName}-upload`);
    cy.get('#destination').clear().type(QUAY_UL_URL);
    cy.get('#username').clear().type(QUAY_UL_USER);
    cy.get('#password').clear().type(QUAY_UL_PASSWD);
    cy.byButtonText('Upload').click();
    cy.byButtonText('Upload').should('be.disabled');
    cy.contains('Started').should('exist');
    cy.contains('In process').should('exist');
    cy.contains('Completed').should('exist');
    cy.get(closeButton).click();
  });

  xit(
    'ID(CNV-11747) check upload pod is created',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.exec(`oc get pods -n ${TEST_NS}`, { failOnNonZeroExit: false }).then(($res) => {
        cy.task('log', $res.stdout);
        expect($res.stdout.includes('uploader'));
      });
      cy.wait(5 * SECOND);
    },
  );

  it('delete Bootable volume', () => {
    cy.checkTitle(bootVol);
    cy.byButtonText('Actions').click();
    cy.byButtonText('Delete').click();
    cy.checkTitle('Delete DataSource?');
    cy.contains('strong', bootVol).should('exist');
    cy.get(pvcCheckbox, { timeout: MINUTE }).check();
    cy.byButtonText('Delete').click();
    cy.contains(sel.row, bootVol, { timeout: MINUTE }).should('not.exist');
    cy.visitPVC();
    cy.contains(sel.row, bootVol, { timeout: MINUTE }).should('not.exist');
  });

  it('Detach hot plugged disk', () => {
    cy.visitVMs();
    cy.contains(sel.treeNode, TEST_NS).click();
    cy.byLegacyTestID(VM_IT_QUICK.name).click();
    tab.navigateToConfigurationStorage();
    getRow(diskName, () => cy.get(sel.actionsBtn).click());
    cy.byButtonText('Detach').click();
    cy.checkTitle('Detach disk?');
    cy.contains('strong', diskName).should('exist');
    // cy.get('#delete-owned-resource').check();
    cy.byButtonText('Detach').click();
    cy.contains(sel.row, diskName).within(() => {
      cy.contains(sel.labelContent, AutoDetachLbl).should('exist');
    });
    cy.contains(pending, { timeout: MINUTE }).should('exist');
    action.restart(VM_IT_QUICK.name, false);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Starting, false);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Running, false);
    cy.contains(sel.row, diskName).should('not.exist');
  });
});
