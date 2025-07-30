import { adminOnlyDescribe, MINUTE, SECOND, TEST_NS } from '../../../utils/const/index';
import { NAD_OVN } from '../../../utils/const/nad';
import { getRow } from '../../../views/actions';
import { actionsBtn, itemCreateBtn } from '../../../views/selector-common';

const networkCheckup = 'kubevirt-vm-latency-checkup';
const storageCheckup = 'kubevirt-storage-checkup';

adminOnlyDescribe('Test checkups', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitCheckup();
    cy.switchProject(TEST_NS);
  });

  it('ID(CNV-10702) run checkup on network latency page', () => {
    cy.contains(itemCreateBtn, 'Run checkup').click();
    cy.wait(SECOND);
    cy.get('[data-test="list-page-create-dropdown-item-network"]').find('button').click();
    cy.byButtonText('Select NetwrokAttachmentDefinition').click();
    cy.byButtonText(NAD_OVN.name).click();
    cy.get('input#nodes').check();
    cy.byButtonText('Select source node').click();
    cy.contains(Cypress.env('FIRST_NODE')).should('exist');
    cy.contains(Cypress.env('SECOND_NODE')).should('exist');
    cy.contains(Cypress.env('THIRD_NODE')).should('exist');
    cy.byButtonText('Select source node').click();
    cy.byButtonText('Select target node').click();
    cy.contains(Cypress.env('FIRST_NODE')).should('exist');
    cy.contains(Cypress.env('SECOND_NODE')).should('exist');
    cy.contains(Cypress.env('THIRD_NODE')).should('exist');
    cy.byButtonText('Select target node').click();
    cy.get('input#nodes').uncheck();
    cy.byButtonText('Run').click();
    getRow(networkCheckup, () => cy.contains('Running', { timeout: MINUTE }).should('exist'));
  });

  it('ID(CNV-10702) verify the latency checkup details', () => {
    cy.contains(networkCheckup).click();
    cy.checkSubTitle('Latency checkup details', 10 * SECOND);
    cy.contains('a', TEST_NS).should('exist');
    cy.contains('a', NAD_OVN.name).should('exist');
    cy.byButtonText('Network latency checkup').click();
    getRow(networkCheckup, () => cy.contains('Running', { timeout: MINUTE }).should('exist'));
  });

  it(
    'ID(CNV-10702) verify latency checkup is finished',
    {
      retries: {
        openMode: 10,
        runMode: 10,
      },
    },
    () => {
      getRow(networkCheckup, () => cy.contains('Running', { timeout: MINUTE }).should('not.exist'));
    },
  );

  it('ID(CNV-10702) report the latency checkup result', () => {
    cy.get('.CheckupsNetworkStatusIcon--main').within(($status) => {
      cy.task('log', `Latency checkup ${$status.text()}.`);
    });
  });

  it('ID(CNV-10702) delete the latency checkup item', () => {
    getRow(networkCheckup, () => cy.get(actionsBtn).click());
    cy.byButtonText('Delete').click();
    cy.get('footer').within(() => {
      cy.byButtonText('Delete').click();
    });
    cy.contains(networkCheckup, { timeout: 5 * MINUTE }).should('not.exist');
  });

  it('ID(CNV-10703) run checkup on storage page', () => {
    cy.byButtonText('Storage').click();
    cy.contains(itemCreateBtn, 'Run checkup').click();
    cy.wait(SECOND);
    cy.get('[data-test="list-page-create-dropdown-item-storage"]').find('button').click();
    cy.get('input#timeout').clear().type('5');
    cy.byButtonText('Run').click();
    getRow(storageCheckup, () => cy.contains('Running', { timeout: MINUTE }).should('exist'));
  });

  it('ID(CNV-10703) verify the storage checkup details', () => {
    cy.contains(storageCheckup).click();
    cy.checkSubTitle('Storage checkup details', 10 * SECOND);
    cy.contains('a', TEST_NS).should('exist');
    cy.byButtonText('Storage checkup').click();
    getRow(storageCheckup, () => cy.contains('Running', { timeout: MINUTE }).should('exist'));
  });

  it(
    'ID(CNV-10703) verify storage checkup is finished',
    {
      retries: {
        openMode: 10,
        runMode: 10,
      },
    },
    () => {
      getRow(storageCheckup, () => cy.contains('Running', { timeout: MINUTE }).should('not.exist'));
    },
  );

  it('ID(CNV-10703) report the storage checkup result', () => {
    cy.get('.CheckupsNetworkStatusIcon--main').within(($status) => {
      cy.task('log', `Storage checkup ${$status.text()}.`);
    });
  });

  it('ID(CNV-10703) delete the storage checkup item', () => {
    getRow(storageCheckup, () => cy.get(actionsBtn).click());
    cy.byButtonText('Delete').click();
    cy.get('footer').within(() => {
      cy.byButtonText('Delete').click();
    });
    cy.contains(storageCheckup, { timeout: 5 * MINUTE }).should('not.exist');
  });
});
