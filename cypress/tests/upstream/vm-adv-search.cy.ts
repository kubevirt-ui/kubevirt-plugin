import { K8S_KIND, OS_IMAGES_NS, TEST_NS } from '../../utils/const/index';

const SEARCH_NS = 'auto-search-ns';
const SAVE_NAME = 'Saved search CNV QE';
const SAVE_DESCR = 'CNV QE Testing save';
const CENTOS9_VM = 'centos-stream9-sssss';
const CENTOS10_VM = 'centos-stream10-sssss';
const FEDORA_VM = 'fedora-sssss';
const SRCH_VMS = [CENTOS9_VM, CENTOS10_VM, FEDORA_VM];
const U1_SM_IT = 'u1.small';
const O1_MD_IT = 'o1.medium';
const CX1_LG_IT = 'cx1.large';

const NAME_CELL = 'td[data-label="name"]';
const ADV_SRCH_BTN = 'button[data-test="vm-advanced-search"]';

const searchVMsListed = (existence: boolean) => {
  SRCH_VMS.forEach((name) => {
    cy.contains(NAME_CELL, name).should(existence ? 'exist' : 'not.exist');
  });
};

const createTestVM = (
  vm_name: string,
  instancetype: string,
  preference: string,
  volume: string,
) => {
  cy.exec(
    `virtctl create vm --name=${vm_name} -n ${SEARCH_NS} --instancetype=${instancetype} --preference=${preference} --volume-datasource=src:${OS_IMAGES_NS}/${volume} | oc create -f -`,
  );
  cy.exec(`oc label vm ${vm_name} -n ${SEARCH_NS} instancetype/${instancetype}=true`);
  cy.exec(`oc annotate vm ${vm_name} -n ${SEARCH_NS} description='Created from ${volume}'`);
};

describe('Test Advanced search for VMs', () => {
  before(() => {
    cy.exec(`oc new-project ${SEARCH_NS}`, { failOnNonZeroExit: false });
    cy.beforeSpec();
    cy.visitVMsVirt();
    cy.switchProject(SEARCH_NS);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.Project, SEARCH_NS);
    cy.exec(`oc project ${TEST_NS}`, { failOnNonZeroExit: false });
  });

  it('create test VMs', () => {
    createTestVM(FEDORA_VM, U1_SM_IT, 'fedora', 'fedora');
    createTestVM(CENTOS9_VM, O1_MD_IT, 'centos.stream9', 'centos-stream9');
    createTestVM(CENTOS10_VM, CX1_LG_IT, 'centos.stream10', 'centos-stream10');
  });

  describe('Test advanced search', () => {
    it('test VM search bar', () => {
      cy.get('#vm-search-input').type('sssss');
      cy.get('.pf-v6-c-panel').within(() => {
        cy.byButtonText('All search results found').should('exist');
        SRCH_VMS.forEach((name) => {
          cy.contains(`a[data-test-id="${name}"]`, name)
            .should('have.attr', 'href')
            .and('contain', name);
        });
      });
      cy.get('button[data-test="results-advanced-search"]').click();
      cy.get('button[aria-label="Close"]').click();
      cy.get('button[aria-label="Reset"]').click();
      cy.get('#vm-search-input').should('not.have.value');
    });

    it('test VM search in other project', () => {
      cy.get(ADV_SRCH_BTN).click();
      cy.get('[data-test="adv-search-vm-project-toggle"]').find('input').type(TEST_NS);
      cy.contains('button.pf-v6-c-menu__item', TEST_NS).click();
      cy.clickSearchBtn();
      searchVMsListed(false);
    });

    it('test VM search by description', () => {
      ['centos-stream9', 'centos-stream10', 'fedora'].forEach((volume) => {
        cy.get(ADV_SRCH_BTN).click();
        cy.get('input[data-test="adv-search-vm-description"]').type(volume);
        cy.clickSearchBtn();
        cy.contains(NAME_CELL, volume).should('exist');
      });
    });

    it('test VM search by labels', () => {
      cy.get(ADV_SRCH_BTN).click();
      cy.get('[data-test="adv-search-vm-labels-toggle"]').find('input').type(O1_MD_IT);
      cy.byButtonText(`instancetype/${O1_MD_IT}=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('[data-test="adv-search-vm-labels-toggle"]').find('input').type(CX1_LG_IT);
      cy.byButtonText(`instancetype/${CX1_LG_IT}=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('[data-test="adv-search-vm-labels-toggle"]').find('input').type(U1_SM_IT);
      cy.byButtonText(`instancetype/${U1_SM_IT}=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('exist');
    });

    it('test VM search by vCPU', () => {
      cy.get(ADV_SRCH_BTN).click();
      cy.get('input[data-test="adv-search-vcpu-value"]').type('1');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('button[data-test="adv-search-vcpu-operator-toggle"]').click();
      cy.byButtonText('Less than').click();
      cy.get('input[data-test="adv-search-vcpu-value"]').type('2');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('exist');
    });

    it('test VM search by memory', () => {
      cy.get(ADV_SRCH_BTN).click();
      cy.get('input[data-test="adv-search-mem-value"]').type('2');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('button[data-test="adv-search-mem-operator-toggle"]').click();
      cy.byButtonText('Less than').click();
      cy.get('input[data-test="adv-search-mem-value"]').type('4');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('exist');
    });

    it('test VM search by IP', () => {
      SRCH_VMS.forEach((name) => {
        cy.exec(`oc get vmi ${name} -n ${SEARCH_NS} -o yaml | grep ipAddress:`, {
          failOnNonZeroExit: false,
        })
          .its('stdout')
          .then((stdout) => {
            const ip = stdout.split(': ')[1];
            if (ip) {
              cy.get(ADV_SRCH_BTN).click();
              cy.get('.pf-v6-c-modal-box[role="dialog"]').within(() => {
                cy.byButtonText('Network').click();
                cy.get('input[data-test="adv-search-vm-ip"]').type(ip);
                cy.clickSearchBtn();
              });
              cy.contains(NAME_CELL, name).should('exist');
            }
          });
      });
    });

    it('test VM search by name', () => {
      cy.get(ADV_SRCH_BTN).click();
      cy.get('input[data-test="adv-search-vm-name"]').type('10');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, CENTOS9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('input[data-test="adv-search-vm-name"]').type('sssss');
      cy.clickSearchBtn();
      searchVMsListed(true);
    });

    it('clear search', () => {
      cy.byButtonText('Clear all filters').click();
      searchVMsListed(true);
    });
  });

  describe('Test saving search', () => {
    it('test saving search', () => {
      cy.get('#vm-search-input').type('centos');
      cy.byButtonText('All search results found').click();
      cy.checkSubTitle('Search results');
      cy.contains(NAME_CELL, CENTOS9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get('button[data-test="save-search"]').click();
      cy.checkTitle('Save search');
      cy.get('input[data-test-id="save-search-name"]').type(SAVE_NAME);
      cy.get('input[data-test-id="save-search-description"]').type(SAVE_DESCR);
      cy.clickSaveBtn();
    });

    it('test reusing saved search', () => {
      cy.byButtonText('Clear all filters').click();
      searchVMsListed(true);
      cy.byButtonText('Saved searches').click();
      cy.get('[data-test="saved-searches"]').within(() => {
        cy.byButtonText(SAVE_NAME).click();
      });
      cy.contains(NAME_CELL, CENTOS9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
    });

    it('test removing saved search', () => {
      cy.byButtonText('Saved searches').click();
      cy.contains('li.pf-v6-c-menu__list-item', SAVE_NAME).within(() => {
        cy.get('button[aria-label="Delete saved search"]').click();
      });
      cy.wait(1000);
      cy.byButtonText('Saved searches').click();
      cy.contains('button', SAVE_NAME).should('not.exist');
      cy.byButtonText('Saved searches').click();
    });

    it('exit search', () => {
      cy.byButtonText('Back to VirtualMachines list').click();
      cy.get('#vms-tree-view-panel').should('exist');
    });
  });
});
