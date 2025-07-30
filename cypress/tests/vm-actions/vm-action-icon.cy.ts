import { DEFAULT_VM_NAME, VM_STATUS } from '../../utils/const/index';
import * as vmView from '../../views/selector-common';
import { waitForStatus } from '../../views/vm-flow';

describe('Test VM actions icon on details tab', () => {
  before(() => {
    cy.visit('', { timeout: 90000 });
    cy.switchToVirt();
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
      cy.navigateToVMs();
    },
  );

  it('go to vm details page', () => {
    cy.get(`[data-test-id="${DEFAULT_VM_NAME}"]`).click();
    cy.wait(5000);
  });

  it('ID(CNV-10539) start VM via start icon', () => {
    cy.get(vmView.startIcon).click();
    cy.wait(60000);
    waitForStatus(DEFAULT_VM_NAME, VM_STATUS.Running, false);
  });

  it('ID(CNV-10539) restart VM via restart icon', () => {
    cy.get(vmView.restartIcon).click();
    cy.wait(60000);
    waitForStatus(DEFAULT_VM_NAME, VM_STATUS.Running, false);
  });

  it('ID(CNV-10539) pause VM via pause icon', () => {
    cy.get(vmView.pauseIcon).click();
    cy.wait(6000);
    waitForStatus(DEFAULT_VM_NAME, VM_STATUS.Paused, false);
    // TODO: add test after https://issues.redhat.com/browse/CNV-51525
  });

  it('ID(CNV-10539) unpause VM via unpause icon', () => {
    cy.get(vmView.unpauseIcon).click();
    cy.wait(6000);
    waitForStatus(DEFAULT_VM_NAME, VM_STATUS.Running, false);
  });

  it('ID(CNV-10539) stop VM via stop icon', () => {
    cy.get(vmView.stopIcon).click();
    cy.wait(6000);
    waitForStatus(DEFAULT_VM_NAME, VM_STATUS.Stopped, false);
  });
});
