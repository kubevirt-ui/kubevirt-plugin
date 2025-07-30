import {
  adminOnlyDescribe,
  MINUTE,
  SECOND,
  snoDescribe,
  VM_STATUS,
} from '../../../utils/const/index';
import { pending } from '../../../utils/const/string';
import { VM_EXAMPLE } from '../../../utils/const/testVM';
import { action, MIGRATE_COMPUTE } from '../../../views/actions';
import {
  detailsCard,
  infoItem,
  vmDetailNode,
  vmStatusOnOverview,
} from '../../../views/selector-common';
import { progress } from '../../../views/selector-instance';
import * as oView from '../../../views/selector-overview';
import { expandSection } from '../../../views/selector-template';
import { tab } from '../../../views/tab';
import { getRow, waitForStatus } from '../../../views/vm-flow';

let original_node;

// temporarily disabled as migration is broken
// adminOnlyDescribe('Test VMI migrations', () => {
xdescribe('Test VMI migrations', () => {
  before(() => {
    cy.patchVM(VM_EXAMPLE.name, 'Always');
    cy.beforeSpec();
  });

  after(() => {
    cy.patchVM(VM_EXAMPLE.name, 'Halted');
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMs();
    },
  );

  it('start VMI migration', () => {
    waitForStatus(VM_EXAMPLE.name, VM_STATUS.Running);
    cy.byLegacyTestID(VM_EXAMPLE.name).click();
    cy.get(vmDetailNode)
      .next()
      .then(($node) => {
        original_node = $node.text();
      });
    action.migrate(VM_EXAMPLE.name, false);
    cy.wait(MINUTE);
  });

  it(
    'wait for VMI migration complete',
    {
      retries: {
        runMode: 10,
      },
    },
    () => {
      cy.contains('.pf-v6-c-alert__title', pending).should('not.exist');
    },
  );

  // disabled, since the migration is very fast and UI lags
  xit('ID(CNV-9365) monitor VMI migration', () => {
    cy.get(detailsCard).scrollIntoView();
    cy.contains(vmStatusOnOverview, 'button').click();
    cy.get(oView.popOverContent).within(() => {
      cy.contains('h6', 'VirtualMachine migration').should('exist');
      cy.contains('b', 'Phase').should('exist');
      cy.contains('b', 'Started').should('exist');
      cy.contains('b', 'Elapsed time').should('exist');
      cy.contains('b', 'Policy').should('exist');
      cy.contains('a', 'Migration metrics')
        .should('have.attr', 'href')
        .and('contain', '/metrics?migration');
    });
    cy.wait(500);
  });

  // disabled, since the UI is slow
  xit('ID(CNV-8886) verify node is different one after migrate', () => {
    waitForStatus(VM_EXAMPLE.name, VM_STATUS.Running, false);
    cy.wait(3 * SECOND); // UI does not update node that quick, so wait for enough time here
    cy.get(vmDetailNode)
      .next()
      .then(($newNode) => {
        expect($newNode.text()).not.equal(original_node);
      });
  });

  xit('ID(CNV-10729) check LiveMigration progress indication', () => {
    tab.navigateToMetrics();
    // cy.get('.timerange--main__text').find('button').click();
    cy.wait(SECOND);
    // cy.byButtonText('3 hours').click();
    cy.contains(expandSection, 'Migration').scrollIntoView();
    cy.wait(3 * SECOND);
    cy.contains(expandSection, 'Migration').within(($section) => {
      if (!$section.hasClass('pf-v6-m-expanded')) {
        cy.wrap($section).click();
      }
      cy.contains(oView.cardTitleV6, 'LiveMigration progress').should('exist');
      cy.contains(progress, '100%').should('exist');
    });
  });

  it('ID(CNV-9370) Virtualization Migrations page', () => {
    cy.visitOverviewVirt();
    tab.navigateToMigrations();
    cy.byButtonText('Last').click();
    cy.byButtonText('1 hour').click();
    getRow(VM_EXAMPLE.name, () => cy.get('td[data-label="status"]').should('contain', 'Succeeded'));
    const maxPerClusterSpec = '.spec.liveMigrationConfig.parallelMigrationsPerCluster';
    const maxPerNodeSpec = '.spec.liveMigrationConfig.parallelOutboundMigrationsPerNode';
    cy.contains('a', 'Limitations').click();
    cy.get(oView.popOverContent).within(() => {
      cy.contains('h3', 'Live migrations settings').should('exist');
      cy.exec(
        `oc get -n openshift-cnv hyperconverged kubevirt-hyperconverged -o jsonpath='{${maxPerClusterSpec}}'`,
      ).then(($res) => {
        cy.contains(infoItem, 'per cluster').should('contain', $res.stdout);
      });
      cy.exec(
        `oc get -n openshift-cnv hyperconverged kubevirt-hyperconverged -o jsonpath='{${maxPerNodeSpec}}'`,
      ).then(($res) => {
        cy.contains(infoItem, 'per node').should('contain', $res.stdout);
      });
    });
  });
});

snoDescribe('Tweaks for SNO', () => {
  before(() => {
    cy.patchVM(VM_EXAMPLE.name, 'Always');
  });

  after(() => {
    cy.patchVM(VM_EXAMPLE.name, 'Halted');
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

  it('ID(CNV-9534) VM migration action is disabled on SNO cluster ', () => {
    cy.byLegacyTestID(VM_EXAMPLE.name).click();
    cy.byButtonText('Actions').click();
    cy.byButtonText('Migration').click();
    cy.byLegacyTestID(MIGRATE_COMPUTE).should('be.disabled');
  });
});
