import { adminOnlyDescribe, TEST_NS } from '../../utils/const/index';
import { VM_IT_CUST } from '../../utils/const/testVM';
import { tab } from '../../views/tab';

const ipAddr = '192.168.1.1';

adminOnlyDescribe('Test VM SSH', () => {
  before(() => {
    cy.visit('', { timeout: 90000 });
    cy.switchToVirt();
  });

  it(
    'visit VM details tab',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
      cy.byLegacyTestID(VM_IT_CUST.name).click();
      tab.navigateToConfigurationDetails();
      cy.contains('Description').should('be.visible');
    },
  );

  it('ID(CNV-10727) check that SSH is disabled in VM SSH tab', () => {
    tab.navigateToConfigurationSSH();
    cy.wait(2000);
    cy.contains('SSH access').click();
    cy.contains('.pf-v6-c-menu-toggle__text', 'None').click({ force: true });
    cy.get('[aria-disabled="true"]').should('exist');
  });

  it('ID(CNV-10727) enable SSH over nodeport', () => {
    cy.visitVirtPerspectiveOverview();
    tab.navigateToSettings();
    cy.contains('General settings').click();
    cy.contains('SSH configuration').click();
    cy.get('input[id="node-address"]').clear().type(ipAddr);
    cy.get('div[id="node-port-feature"]').find('input[type="checkbox"]').check({ force: true });
    cy.wait(2000);
    cy.get('div[id="node-port-feature"]').find('input[type="checkbox"]').should('be.checked');
  });

  it(
    'visit VM SSH tab',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
      cy.byLegacyTestID(VM_IT_CUST.name).click();
      tab.navigateToConfigurationDetails();
      cy.contains('Description').should('be.visible');
    },
  );

  it('ID(CNV-10727) check that SSH in VM SSH tab', () => {
    tab.navigateToConfigurationSSH();
    cy.wait(2000);
    cy.contains('SSH access').click();
    cy.contains('.pf-v6-c-menu-toggle__text', 'None').click();
    cy.get('button[id="NodePort"]').click();
    cy.get('[data-test="ssh-command-copy"]')
      .find('input[aria-label="Copyable input"]')
      .invoke('attr', 'value')
      .should('contain', `${ipAddr}`);
  });
});
