import { K8S_KIND, OS_IMAGES_NS, TEST_NS } from '../../utils/const/index';

const SEARCH_NS = 'auto-search-ns';
const SAVE_NAME = 'Saved search CNV QE';
const SAVE_DESCR = 'CNV QE Testing save';
// Prefer Ready golden volumes on OCP 4.20+/CNV stable (rhel9, centos-stream10, fedora).
const RHEL9_VM = 'rhel9-sssss';
const CENTOS10_VM = 'centos-stream10-sssss';
const FEDORA_VM = 'fedora-sssss';
const SRCH_VMS = [RHEL9_VM, CENTOS10_VM, FEDORA_VM];
const U1_SM_IT = 'u1.small';
const O1_MD_IT = 'o1.medium';
// Prefer u1.large over cx1.large: same >1 vCPU / >=4Gi profile without dedicatedCPU/hugepages
// so the VM can actually become Ready on small hot-cluster nodes.
const U1_LG_IT = 'u1.large';

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
    `bash -c 'set -o pipefail; virtctl create vm --name=${vm_name} -n ${SEARCH_NS} --instancetype=${instancetype} --preference=${preference} --volume-datasource=src:${OS_IMAGES_NS}/${volume} | oc create -f -'`,
  );
  cy.exec(`oc label vm ${vm_name} -n ${SEARCH_NS} instancetype/${instancetype}=true`);
  cy.exec(`oc annotate vm ${vm_name} -n ${SEARCH_NS} description='Created from ${volume}'`);
};

// Memory/vCPU advanced filters read guest resources from the VMI. InstanceType-only
// VMs have no domain.memory until started, so GreaterThan filters exclude them.
const startAndWaitReady = (vm_name: string) => {
  cy.exec(
    `oc patch vm ${vm_name} -n ${SEARCH_NS} --type merge -p '{"spec":{"runStrategy":"Always"}}'`,
  );
  cy.exec(`oc wait --for=condition=Ready vm/${vm_name} -n ${SEARCH_NS} --timeout=300s`, {
    timeout: 320000,
  });
};

const dismissOpenDialogs = () => {
  cy.get('body').then(($body) => {
    if ($body.find('.pf-v6-c-modal-box button[aria-label="Close"]').length) {
      cy.get('.pf-v6-c-modal-box button[aria-label="Close"]').click({ force: true });
    }
    if ($body.find('.saved-searches-dropdown-menu').length) {
      cy.get('body').type('{esc}');
    }
  });
};

describe('Test Advanced search for VMs', () => {
  before(() => {
    cy.newProject(SEARCH_NS);
    cy.beforeSpec();
    cy.visitVMsVirt();
    cy.switchProject(SEARCH_NS);
  });

  beforeEach(() => {
    // Only dismiss stray dialogs here. Several tests below (`clear search`,
    // `test reusing saved search`, `exit search`) deliberately consume the
    // filter/search-results state left by the immediately preceding test, so
    // clearing filters or re-switching the project on every test would wipe
    // that state before the test body runs.
    dismissOpenDialogs();
  });

  after(() => {
    cy.deleteResource(K8S_KIND.Project, SEARCH_NS);
    cy.exec(`oc project ${TEST_NS}`, { failOnNonZeroExit: false });
    // Reset the UI's project context too -- `oc project` only affects the CLI,
    // and leaving the UI on the now-deleted SEARCH_NS cascades into later specs.
    cy.switchProject(TEST_NS);
  });

  it('create test VMs', () => {
    cy.exec(`oc get ns ${SEARCH_NS} -o jsonpath='{.status.phase}'`)
      .its('stdout')
      .should('eq', 'Active');

    [FEDORA_VM, RHEL9_VM, CENTOS10_VM].forEach((vm) => {
      cy.exec(
        `oc delete vm ${vm} -n ${SEARCH_NS} --ignore-not-found=true --wait=true --timeout=180s`,
        {
          timeout: 200000,
        },
      );
    });
    createTestVM(FEDORA_VM, U1_SM_IT, 'fedora', 'fedora');
    createTestVM(RHEL9_VM, O1_MD_IT, 'rhel.9', 'rhel9');
    createTestVM(CENTOS10_VM, U1_LG_IT, 'centos.stream10', 'centos-stream10');
    // Start after all creates so memory/vCPU filters can resolve guest resources.
    [FEDORA_VM, RHEL9_VM, CENTOS10_VM].forEach(startAndWaitReady);
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
      ['rhel9', 'centos-stream10', 'fedora'].forEach((volume) => {
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
      cy.contains(NAME_CELL, RHEL9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('[data-test="adv-search-vm-labels-toggle"]').find('input').type(U1_LG_IT);
      cy.byButtonText(`instancetype/${U1_LG_IT}=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('[data-test="adv-search-vm-labels-toggle"]').find('input').type(U1_SM_IT);
      cy.byButtonText(`instancetype/${U1_SM_IT}=true`).click();
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('exist');
    });

    it('test VM search by vCPU', () => {
      cy.get(ADV_SRCH_BTN).click();
      cy.get('input[data-test="adv-search-vcpu-value"]').type('1');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('button[data-test="adv-search-vcpu-operator-toggle"]').click();
      cy.byButtonText('Less than').click();
      cy.get('input[data-test="adv-search-vcpu-value"]').type('2');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, RHEL9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('not.exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('exist');
    });

    it('test VM search by memory', () => {
      // u1.small=2Gi, o1.medium=4Gi, u1.large=8Gi — default operator is Greater than.
      cy.get(ADV_SRCH_BTN).click();
      cy.get('input[data-test="adv-search-mem-value"]').type('2');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, RHEL9_VM).should('exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get(ADV_SRCH_BTN).click();
      cy.get('button[data-test="adv-search-mem-operator-toggle"]').click();
      cy.byButtonText('Less than').click();
      cy.get('input[data-test="adv-search-mem-value"]').type('4');
      cy.clickSearchBtn();
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
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
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
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
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
      cy.get('button[data-test="save-search"]').click();
      cy.checkTitle('Save search');
      cy.get('input[data-test-id="save-search-name"]').type(SAVE_NAME);
      cy.get('input[data-test-id="save-search-description"]').type(SAVE_DESCR);
      cy.clickSaveBtn();
      // User-settings persistence is async; assert the entry landed before later tests
      // open the empty-state dropdown (which has no [data-test="saved-searches"]).
      cy.byButtonText('Saved searches').click();
      cy.get('[data-test="saved-searches"]', { timeout: 60000 }).should('contain', SAVE_NAME);
      cy.get('body').type('{esc}');
    });

    it('test reusing saved search', () => {
      cy.byButtonText('Clear all filters').click();
      searchVMsListed(true);
      cy.byButtonText('Saved searches').click();
      cy.get('[data-test="saved-searches"]', { timeout: 60000 }).within(() => {
        cy.byButtonText(SAVE_NAME).click();
      });
      cy.contains(NAME_CELL, RHEL9_VM).should('not.exist');
      cy.contains(NAME_CELL, CENTOS10_VM).should('exist');
      cy.contains(NAME_CELL, FEDORA_VM).should('not.exist');
    });

    it('test removing saved search', () => {
      cy.byButtonText('Saved searches').click();
      cy.contains('li.pf-v6-c-menu__list-item', SAVE_NAME, { timeout: 60000 }).within(() => {
        cy.get('button[aria-label="Delete saved search"]').click();
      });
      cy.wait(1000);
      cy.byButtonText('Saved searches').click();
      cy.contains('button', SAVE_NAME).should('not.exist');
      // Close the menu so it does not cover "Back to VirtualMachines list".
      cy.get('body').type('{esc}');
    });

    it('exit search', () => {
      dismissOpenDialogs();
      cy.byButtonText('Back to VirtualMachines list').click({ force: true });
      cy.get('#vms-tree-view-panel').should('exist');
    });
  });
});
