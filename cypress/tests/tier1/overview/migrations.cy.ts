import { adminOnlyDescribe } from '../../../utils/const/index';
import { VM_IT_CUST } from '../../../utils/const/testVM';
import { tab } from '../../../views/tab';

adminOnlyDescribe('Test Virtualization Overview migration page', () => {
  before(() => {
    cy.visit('');
    cy.patchVM(VM_IT_CUST.name, 'Always');
    cy.switchToVirt();
    cy.visitOverviewVirt();
  });

  after(() => {
    cy.patchVM(VM_IT_CUST.name, 'Halted');
  });

  it('migrate the VM to generate migration metrics', () => {
    cy.wait(30000);
    cy.exec(`virtctl migrate ${VM_IT_CUST.name}`);
    cy.wait(30000);
  });

  it('ID(CNV-9297) check migrations tab', () => {
    tab.navigateToMigrations();
    cy.get('.pf-v6-c-card__actions.co-overview-card__actions').eq(0).click();
    cy.contains('.pf-v6-c-menu__item-text', 'Last 1 hour').click();
    cy.get('[data-label="vmim-name"]').find('a').click();
    cy.contains('VirtualMachineInstanceMigration details').should('exist');
  });
});
