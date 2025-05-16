import { VM_STATUS } from '../../../utils/const/index';
import { VM_IT_QUICK, VM_TMPL_QUICK } from '../../../utils/const/testVM';
import { waitForStatus } from '../../../views/vm-flow';

describe('Right-click of project/folder', () => {
  before(() => {
    cy.visitVMs();
  });

  it('start two VMs for test', () => {
    cy.startVM(VM_IT_QUICK.name);
    cy.startVM(VM_TMPL_QUICK.name);
  });

  it('stop vms by right-click of project', () => {
    cy.contains('button.pf-v6-c-tree-view__node-text', 'default', { timeout: 180000 }).rightclick();
    cy.contains('span.pf-v6-c-menu__item-text', 'Stop').click();
    waitForStatus(VM_TMPL_QUICK.name, VM_STATUS.Stopped);
    waitForStatus(VM_IT_QUICK.name, VM_STATUS.Stopped);
  });
});
