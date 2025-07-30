import { TEST_NS, VM_STATUS } from '../../utils/const/index';
import { VM_IT_CUST } from '../../utils/const/testVM';
import { action } from '../../views/actions';
import * as vmView from '../../views/selector-common';
import { tab } from '../../views/tab';
import { waitForStatus } from '../../views/vm-flow';

describe('Test VM overview tab', () => {
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
    },
  );

  it('unpause VM', () => {
    action.unpause(VM_IT_CUST.name, false);
    waitForStatus(VM_IT_CUST.name, VM_STATUS.Running, false);
  });

  it('ID(CNV-8839) check details card', () => {
    cy.get(vmView.detailsCard).within(() => {
      cy.get(vmView.vmName).should('contain', VM_IT_CUST.name);
      cy.get(vmView.vmCreatedOnOverview).should('exist');
      cy.get(vmView.vmOSOnOverview).should('exist');
      cy.get(vmView.vmCpuMemOnOverview).should('exist');
      cy.get(vmView.vmHostnameOnOverview).should('exist');
      cy.get('.vnc-container').should('exist');
      cy.contains('Connecting').should('not.exist');
      cy.get(vmView.vmStatusOnOverview).should('contain', VM_STATUS.Running).click();
      cy.contains('View diagnostic').click();
      cy.contains('Status conditions').should('exist');
    });
  });

  it('navigate back to overview tab', () => {
    tab.navigateToOverview();
  });

  it('ID(CNV-8841) check alerts card', () => {
    cy.get(vmView.alertsCard).should('exist');
  });

  it('ID(CNV-8843) check network interfaces card', () => {
    cy.contains('No snapshots found').scrollIntoView();
    cy.get(vmView.networkCard).within(() => {
      cy.get(vmView.nicDefault).click();
    });
    cy.get(vmView.descrText).contains('Name').should('exist');
    cy.get(vmView.descrText).contains('Model').should('exist');
    cy.get(vmView.descrText).contains('Network').should('exist');
    cy.get(vmView.descrText).contains('Type').should('exist');
    cy.get('div.VirtualMachinesOverviewTabInterfaces--main')
      .find('.pf-v6-c-card__title')
      .find('a')
      .click();
    cy.byButtonText('Add network interface').should('exist');
  });

  it('navigate back to overview tab', () => {
    tab.navigateToOverview();
  });

  it('ID(CNV-8844) Check Disks card', () => {
    cy.get(vmView.disksCard).within(() => {
      cy.byLegacyTestID('disk-rootdisk').should('exist');
      cy.byLegacyTestID('disk-cloudinitdisk').should('exist');
      ['Name', 'Drive', 'Size', 'Interface'].forEach((th) => {
        cy.get(`th[data-label="${th}"]`).should('exist');
      });
    });
    cy.get('a').should('not.have.attr', 'data-test-id').contains('Storage ').click();
    cy.byButtonText('Add disk').should('exist');
  });

  it('navigate back to overview tab', () => {
    tab.navigateToOverview();
  });

  it('ID(CNV-8845) Check Utilization card', () => {
    cy.get(vmView.utilizationCard).scrollIntoView();
    cy.get(vmView.utilizationCard).within(() => {
      cy.byLegacyTestID('util-summary-cpu').should('contain', 'Requested of');
      cy.byLegacyTestID('util-summary-memory').should('contain', 'Used of');
      cy.byLegacyTestID('util-summary-storage').should('contain', 'Used of');
      cy.byLegacyTestID('util-summary-network-transfer').should('contain', 'Total');
      cy.get('.util-chart').should('have.length', 3);
      cy.get('a')
        .should('have.attr', 'href')
        .and('have.string', '/monitoring/query-browser?&query0=');
      cy.contains('Last 5 minutes').should('be.visible');
    });
  });

  it('ID(CNV-8846) Check Hardware devices card', () => {
    cy.get(vmView.hardwareCard).within(() => {
      cy.contains('GPU devices').should('have.attr', 'aria-selected').and('equal', 'true');
      cy.contains('Host devices').should('have.attr', 'aria-selected').and('equal', 'false');
      cy.contains('Host devices').click();
      cy.contains('GPU devices').should('have.attr', 'aria-selected').and('equal', 'false');
    });
  });

  it('ID(CNV-8842) Verify Snapshots card', () => {
    cy.get(vmView.snapshotsCard).within(() => {
      cy.get('button').contains('Take snapshot').click();
    });
    cy.clickSaveBtn();
    cy.get(vmView.snapshotsCard).within(() => {
      cy.get('a').contains('Snapshots (1)').click();
    });
    cy.get('[data-test="success-icon"]').should('exist');
  });
});

describe('Test VM network endpoint using headless Services', () => {
  it('navigate back to overview tab', () => {
    tab.navigateToOverview();
  });

  it('ID(CNV-11229) check headless service', () => {
    cy.exec('oc get service headless');
  });

  it('ID(CNV-11229) check FQDN of the VM', () => {
    cy.contains(`${VM_IT_CUST.name}.headless.${TEST_NS}.svc.cluster.local`).should('exist');
  });
});

describe('Test VM Metrics tab', () => {
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
