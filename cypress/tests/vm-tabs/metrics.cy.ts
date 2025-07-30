import { VM_IT_CUST } from '../../utils/const/testVM';
import { tab } from '../../views/tab';

describe('Test VM Metrics tab', () => {
  before(() => {
    cy.visit('', { timeout: 90000 });
    cy.switchToVirt();
  });

  it(
    'visit VM details tab',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
      cy.byLegacyTestID(VM_IT_CUST.name).click();
    },
  );

  it('ID(CNV-9389) VM Metrics tab content', () => {
    tab.navigateToMetrics();
    cy.get('div#utilization').should('not.contain', 'No data available');
    cy.get('div#storage').should('not.contain', 'No data available');
    cy.get('div#network').should('not.contain', 'No data available');
  });

  it('ID(CNV-9389) check Virtualization dashboard link', () => {
    cy.contains('a', 'Virtualization dashboard').click();
    cy.wait(3000);
    cy.contains('KubeVirt / Infrastructure Resources / Top Consumers').should('exist');
  });
});
