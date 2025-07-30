import { VM_IT_CUST } from '../../utils/const/testVM';

describe('Start test VM', () => {
  it('start test VMs', () => {
    cy.patchVM(VM_IT_CUST.name, 'Always');
    cy.wait(20000);
  });
});
