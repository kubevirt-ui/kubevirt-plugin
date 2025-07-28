import {
  CUST_VM_IT_NAME,
  CUST_VM_TMPL_NAME,
  DEFAULT_VM_NAME,
  OCP_NS,
  TEST_NS,
} from '../../../utils/const/index';

const SAVE_NAME = 'Saved search CNV QE';
const SAVE_DESCR = 'CNV QE Testing save';
const NAME_CELL = 'td[data-label="name"]';
const ADV_SRCH_BTN = 'vm-advanced-search';

describe('Test Advanced search for VMs', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitVMsVirt();
    cy.startVM([DEFAULT_VM_NAME, CUST_VM_TMPL_NAME, CUST_VM_IT_NAME]);
    cy.exec(`oc label vm ${CUST_VM_IT_NAME} -n ${TEST_NS} instancetype=true`);
    cy.exec(`oc label vm ${CUST_VM_TMPL_NAME} -n ${TEST_NS} template=true`);
    cy.exec(`oc annotate vm ${CUST_VM_IT_NAME} -n ${TEST_NS} custom=true'`);
    cy.exec(`oc annotate vm ${CUST_VM_TMPL_NAME} -n ${TEST_NS} custom=true'`);
    cy.exec(`oc annotate vm ${DEFAULT_VM_NAME} -n ${TEST_NS} from=yaml'`);
  });

  describe('Test advanced search', () => {
    it('test VM search bar', () => {
      cy.byTestID('vm-search-input').type('-it-');
      cy.byTestID('search-bar-results').within(() => {
        cy.byButtonText('All search results found').should('exist');
        cy.byLegacyTestID(CUST_VM_IT_NAME)
          .should('have.attr', 'href')
          .and('contain', CUST_VM_IT_NAME);
        cy.byLegacyTestID(CUST_VM_TMPL_NAME)
          .should('have.attr', 'href')
          .and('contain', CUST_VM_TMPL_NAME);
      });
      cy.byTestID('results-advanced-search').click();
      cy.get('button[aria-label="Close"]').click();
      cy.get('button[aria-label="Reset"]').click();
      cy.byTestID('vm-search-input').should('not.have.value');
    });

    it('test VM search in other project', () => {
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vm-project-toggle').find('input').type(OCP_NS);
      cy.contains('button[role="option"]', OCP_NS).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('not.exist');
    });

    it('test VM search by description', () => {
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vm-description').type('Customized');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
    });

    it('test VM search by labels', () => {
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vm-labels-toggle').find('input').type('instancetype');
      cy.byButtonText(`instancetype=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vm-labels-toggle').find('input').type('template');
      cy.byButtonText(`template=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
    });

    it('test VM search by vCPU', () => {
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vcpu-value').type('1');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('not.exist');
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vcpu-value').type('0');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
    });

    it('test VM search by memory', () => {
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-mem-value').type('2');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-mem-operator-toggle').click();
      cy.byButtonText('Less than').click();
      cy.byTestID('adv-search-mem-value').type('4');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('not.exist');
    });

    it('test VM search by IP', () => {
      [DEFAULT_VM_NAME, CUST_VM_TMPL_NAME, CUST_VM_IT_NAME].forEach((name) => {
        cy.exec(`oc get vmi ${name} -n ${TEST_NS} -o yaml | grep ipAddress:`, {
          failOnNonZeroExit: false,
        })
          .its('stdout')
          .then((stdout) => {
            const ip = stdout.split(': ')[1];
            if (ip) {
              cy.byTestID(ADV_SRCH_BTN).click();
              cy.byTestID('adv-search-network').within(() => {
                cy.byButtonText('Network').click();
                cy.byTestID('adv-search-vm-ip').type(ip);
              });
              cy.clickSearchBtn();
              cy.contains(NAME_CELL, name).should('exist');
            }
          });
      });
    });

    it('test VM search by name', () => {
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vm-name').type('custom');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
      cy.byTestID(ADV_SRCH_BTN).click();
      cy.byTestID('adv-search-vm-name').type(DEFAULT_VM_NAME);
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('not.exist');
    });

    it('clear search', () => {
      cy.byButtonText('Clear all filters').click();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
    });
  });

  describe('Test saving search', () => {
    it('test saving search', () => {
      cy.byTestID('vm-search-input').type('-it-');
      cy.byButtonText('All search results found').click();
      cy.checkSubTitle('Search results');
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
      cy.byTestID('save-search').click();
      cy.checkTitle('Save search');
      cy.byLegacyTestID('save-search-name').type(SAVE_NAME);
      cy.byLegacyTestID('save-search-description').type(SAVE_DESCR);
      cy.clickSaveBtn();
    });

    it('test reusing saved search', () => {
      cy.byButtonText('Clear all filters').click();
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
      cy.byButtonText('Saved searches').click();
      cy.byTestID('saved-searches').within(() => {
        cy.byButtonText(SAVE_NAME).click();
      });
      cy.contains(NAME_CELL, DEFAULT_VM_NAME).should('not.exist');
      cy.contains(NAME_CELL, CUST_VM_TMPL_NAME).should('exist');
      cy.contains(NAME_CELL, CUST_VM_IT_NAME).should('exist');
    });

    it('test removing saved search', () => {
      cy.byButtonText('Saved searches').click();
      cy.byTestID(`saved-search-item-${SAVE_NAME}`).within(() => {
        cy.byTestID(`delete-search-item-${SAVE_NAME}`).click();
      });
      cy.wait(1000);
      cy.byButtonText('Saved searches').click();
      cy.contains('button', SAVE_NAME).should('not.exist');
      cy.byButtonText('Saved searches').click();
    });

    it('exit search', () => {
      cy.byButtonText('Back to VirtualMachines list').click();
      cy.byTestID('vms-treeview').should('exist');
    });
  });
});
