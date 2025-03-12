import { topConsumerCard } from '../../views/overview';
import { Perspective, switchPerspective } from '../../views/perspective';
import { tab } from '../../views/tab';

const enum Card {
  CPU = 0,
  Memory,
  Storage_IOPS,
  Storage_throughput,
  Swap,
  vCPU,
}

xdescribe('Test Virtualization Top consumer tab', () => {
  before(() => {
    cy.visit('');
    switchPerspective(Perspective.Administrator);
  });

  it('ID(CNV-9295) check data available for cpu, memory and storage', () => {
    cy.visitOverview();
    tab.navigateToTopConsumers();
    cy.get(topConsumerCard).eq(Card.CPU).should('not.contain', 'No data available');
    cy.get(topConsumerCard).eq(Card.Memory).should('not.contain', 'No data available');
    cy.get(topConsumerCard).eq(Card.Storage_throughput).should('not.contain', 'No data available');
    cy.get(topConsumerCard).eq(Card.Storage_IOPS).should('not.contain', 'No data available');
  });

  // TODO: enable the test until https://github.com/kubevirt-ui/kubevirt-plugin/issues/2499
  xit('ID(CNV-9295) click the view link on the page', () => {
    cy.contains('View virtualization dashboard').click();
    cy.contains('KubeVirt / Infrastructure Resources / Top Consumers').should('exist');
  });
});
