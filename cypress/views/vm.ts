import { ACTION_TIMEOUT, VM_STATUS } from '../utils/const/index';

const vmStatusOnList = '#status';
const vmStatusTop = '.pf-m-compact.vm-resource-label';
export const getRow = (name: string, within: VoidFunction) =>
  cy.byTestRows('resource-row').contains(name).parents('tr').within(within);

export const checkStatus = (
  vmName: string,
  vmStatus: string,
  timeout: ACTION_TIMEOUT,
  onList = true,
) => {
  if (onList) {
    getRow(vmName, () =>
      cy.contains(vmStatusOnList, vmStatus, { timeout: timeout }).should('exist'),
    );
  } else {
    cy.contains(vmStatusTop, vmStatus, {
      timeout: timeout,
    }).should('exist');
  }
};

export const waitForStatus = (vmName: string, status: string, onList = true) => {
  switch (status) {
    case VM_STATUS.Running: {
      checkStatus(vmName, VM_STATUS.Running, ACTION_TIMEOUT.START, onList);
      // wait for vmi appear
      cy.wait(3000);
      break;
    }
    case VM_STATUS.Provisioning: {
      checkStatus(vmName, VM_STATUS.Provisioning, ACTION_TIMEOUT.IMPORT, onList);
      if (onList) {
        getRow(vmName, () =>
          cy
            .contains(vmStatusOnList, VM_STATUS.Provisioning, {
              timeout: ACTION_TIMEOUT.IMPORT,
            })
            .should('not.exist'),
        );
      } else {
        cy.contains(vmStatusTop, VM_STATUS.Provisioning, {
          timeout: ACTION_TIMEOUT.IMPORT,
        }).should('not.exist');
      }
      break;
    }
    case VM_STATUS.Stopped: {
      checkStatus(vmName, VM_STATUS.Stopped, ACTION_TIMEOUT.STOP, onList);
      break;
    }
    case VM_STATUS.Starting: {
      checkStatus(vmName, VM_STATUS.Starting, ACTION_TIMEOUT.START, onList);
      break;
    }
    case VM_STATUS.Migrating: {
      checkStatus(vmName, VM_STATUS.Migrating, ACTION_TIMEOUT.MIGRATE, onList);
      break;
    }
    default: {
      checkStatus(vmName, status, ACTION_TIMEOUT.IMPORT, onList);
      break;
    }
  }
};
