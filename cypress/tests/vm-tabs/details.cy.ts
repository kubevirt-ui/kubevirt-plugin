import { VirtualMachineData } from '../../types/vm';
import { TEST_NS, VM_STATUS } from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import { VM_TMPL_CUST } from '../../utils/const/testVM';
import { action, getRow } from '../../views/actions';
import * as vmView from '../../views/selector-common';
import { tab } from '../../views/tab';
import { editVMDetails } from '../../views/vm-edit-flow';
import { waitForStatus } from '../../views/vm-flow';

const testVM: VirtualMachineData = {
  // description: 'edit vm details',
  bootMode: 'UEFI (secure)',
  // sshOverNodeport: true,
  headless: true,
  hostname: 'edit-hostname',
  name: VM_TMPL_CUST.name,
  startInPause: true,
  workload: 'High performance',
};

describe('Test VM Configuration tab ', () => {
  before(() => {
    cy.beforeSpec;
    cy.visitVMs();
    getRow(testVM.name, () => cy.get('[data-label="name"]').find('a').click());
  });

  describe('Set CPU and memory hotplug', () => {
    it(
      'visit VM details tab',
      {
        retries: {
          runMode: 8,
        },
      },
      () => {
        cy.visitVMs();
        cy.byLegacyTestID(testVM.name).click();
        tab.navigateToConfigurationDetails();
        cy.contains('Description').should('be.visible');
      },
    );

    it('ID(CNV-11228) increase cpu and memory', () => {
      cy.get(vmView.cpuMem).click();
      cy.wait(3000);
      cy.get('label[for="editVCPU"]').find(vmView.plusBtn).click();
      cy.get('div.input-memory').find(vmView.plusBtn).click();
      cy.clickSaveBtn();
      cy.wait(15000); // give some time for VMI update
    });

    // TODO: add check of VMI CPU
  });

  /*
  describe('Test VM details tab', () => {
    before(() => {
      cy.stopVM([testVM.name]);
      cy.wait(15000);
      cy.startVM([testVM.name]);
    });

    it(
      'visit VM',
      {
        retries: {
          runMode: 8,
        },
      },
      () => {
        cy.visitVMs();
        cy.byLegacyTestID(testVM.name).click();
      },
    );

    it(
      'ID(CNV-9687) verify information',
      {
        retries: {
          runMode: 10,
        },
      },
      () => {
        cy.wait(60000);
        cy.contains(vmView.vmOSOnOverview, 'Red Hat Enterprise Linux').should('exist');
        cy.get(vmView.timezone).should('not.contain', '-');
      },
    );

    it('ID(CNV-8888) verify VM details when VM is running', () => {
      tab.navigateToConfigurationDetails();
      cy.get(vmView.hostname(testVM.name)).should('contain', testVM.hostname);
      cy.contains('pc-q35').should('exist');
    });

    it('ID(CNV-8887) verify VM details when VM is off', () => {
      action.stop(testVM.name, false);
      waitForStatus(testVM.name, VM_STATUS.Stopped, false);
      cy.get(vmView.hostname(testVM.name)).should('contain', testVM.hostname);
    });

    it('ID(CNV-8887) edit VM details tab', () => {
      tab.navigateToConfigurationDetails();
      cy.wait(10000);
      editVMDetails(testVM);
      action.start(testVM.name, false);
    });

    xit('ID(CNV-8889) VM description is changed', () => {
      cy.get(vmView.desc(testVM.name)).should('contain', testVM.description);
    });

    it('ID(CNV-8889) VM bootMode is changed', () => {
      cy.get(vmView.bootMode(testVM.name)).should('contain', testVM.bootMode);
    });

    it('ID(CNV-9688) VM hostname is changed', () => {
      cy.contains(vmView.descrText, 'Hostname').scrollIntoView();
      cy.get(vmView.hostname(testVM.name)).should('contain', testVM.hostname);
    });

    it('ID(CNV-8889) VM workload is changed', () => {
      cy.get(vmView.workload(testVM.name)).should('contain', testVM.workload);
    });

    it('ID(CNV-8889) VM headless is ON', () => {
      cy.get(vmView.headlessCheckBtn).should('be.checked');
      tab.navigateToConsole();
      cy.get('.VirtualMachineConsolePage-page-section').should('not.exist');
    });

    it('ID(CNV-9382) VM is started in pause mode', () => {
      tab.navigateToConfigurationDetails();
      cy.contains('Boot management').click();
      waitForStatus(testVM.name, VM_STATUS.Paused, false);
      action.unpause(testVM.name, false);
      waitForStatus(testVM.name, VM_STATUS.Running, false);
    });

    it('ID(CNV-9382) restore the pause mode and headless mode', () => {
      cy.get(vmView.headlessCheckBtn).uncheck({ force: true });
      cy.get(vmView.headlessCheckBtn).should('not.be.checked');
    });

    it('restore test VM by restart', () => {
      cy.patchVM(testVM.name, 'Halted');
      cy.wait(10000);
      cy.patchVM(testVM.name, 'Always');
      cy.wait(60000);
    });
  });

  describe('Test search on configuration tab', () => {
    it('ID(CNV-10724) search configurations', () => {
      tab.navigateToConfiguration();
      cy.get('#VirtualMachineConfigurationTabSearch-autocomplete-search').within(() => {
        cy.get('input[aria-label="Search input"]').type('SSH', { force: true });
      });
      cy.contains('.pf-v6-c-menu__list-item', 'SSH').click();
      cy.contains(authSSHKey).should('exist');
    });
  });

  describe('Check CPU and memory hotplug', () => {
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
        cy.byLegacyTestID(testVM.name).click();
        tab.navigateToConfigurationDetails();
        cy.contains('Description').should('be.visible');
      },
    );

    it('ID(CNV-11228) cpu number is updated in VMI', () => {
      const check_cpu = `oc get vmi ${testVM.name} -o jsonpath='{.spec.domain.cpu.sockets}'`;
      cy.exec(check_cpu).then((result) => {
        expect(result.stdout).contain('2');
      });
    });

    it('ID(CNV-11263) memory is updated in VMI', () => {
      const check_mem = `oc get vmi ${testVM.name} -o jsonpath='{.spec.domain.memory.guest}'`;
      cy.exec(check_mem).then((result) => {
        expect(result.stdout).contain('3Gi');
      });
    });

    it('ID(CNV-11498) test manual cpu topology', () => {
      cy.get(vmView.cpuMem).click();
      cy.get('#editTopologyManually').check();
      cy.get('.cpu-input__edit-topology-manually').within(() => {
        cy.get(vmView.plusBtn).eq(0).click();
        cy.get('input[name="cpu-sockets-input"]').eq(0).should('have.value', '2');
        // cy.get(vmView.plusBtn).eq(1).click();
        cy.get('input[name="cpu-sockets-input"]').eq(1).should('have.value', '2');
        cy.get(vmView.plusBtn).eq(2).click();
        cy.get('input[name="cpu-sockets-input"]').eq(2).should('have.value', '2');
        cy.contains('.cpu-topology-helper-text', '8').should('exist');
      });
      cy.clickSaveBtn();
      cy.contains(vmView.cpuMem, '8 CPU').should('exist');
    });
  });
 */
});
