import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import { adminOnlyDescribe, TEST_NS } from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import * as iView from '../../../views/selector-instance';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

adminOnlyDescribe('Test Cluster Guest management', () => {
  before(() => {
    cy.visit('');
    cy.switchToVirt();
    cy.visitVirtPerspectiveOverview();
  });

  describe('Test auto subscription for RHEL guest', () => {
    const activation_key = 'test-cnv-key'; // fake keys
    const orgID = Math.random().toString(36).slice(-6);
    const runCmd = `runcmd:\\n  - subscription-manager register --org=${orgID} --activationkey=${activation_key}`;
    const insClient = 'insights-client --register';
    const spec = '.spec.template.spec.volumes';

    const testVM: VirtualMachineData = {
      name: 'test-auto-subscription-rhel',
      namespace: TEST_NS,
      startOnCreation: false,
      volume: 'rhel9',
    };
    const testVM1: VirtualMachineData = {
      name: 'test-auto-subscription-centos9',
      namespace: TEST_NS,
      startOnCreation: false,
      volume: 'centos-stream9',
    };
    const testVM2: VirtualMachineData = {
      name: 'test-auto-predictive',
      namespace: TEST_NS,
      startOnCreation: false,
      volume: 'centos-stream9',
    };

    before(() => {
      cy.deleteVM([testVM, testVM1]);
    });

    after(() => {
      cy.deleteVM([testVM, testVM1]);
    });

    it('ID(CNV-10321) fill Activation key for automatic subscription', () => {
      tab.navigateToSettings();
      cy.contains('Guest management').click();
      cy.contains('Automatic subscription').click();
      cy.get('.AutomaticSubscriptionType--main').find('button').click();
      cy.contains('Monitor and manage subscriptions').click();
      cy.wait(5000);
      cy.get('.pf-v5-c-form__group.subscription-label')
        .eq(1)
        .find('input[type="text"]')
        .clear()
        .type(orgID);
      cy.get('.pf-v5-c-form__group.subscription-label')
        .eq(0)
        .find('input[type="text"]')
        .clear()
        .type(activation_key);
      cy.contains('Organization ID').click();
      cy.wait(2000);
      cy.get('div[id="auto-update-rhel-vms"]')
        .find('input.pf-v5-c-switch__input')
        .check({ force: true });
    });

    // the key is not added to the UI, product and framework issue
    xit('ID(CNV-10321) verify Activation key on UI', () => {
      tab.navigateToTopConsumers();
      tab.navigateToSettings();
      cy.contains('Guest management').click();
      cy.contains('Automatic subscription').click();
      cy.contains(activation_key).should('exist');
      cy.contains(orgID).should('exist');
    });

    xit('ID(CNV-10322) activation key is added to RHEL VM', () => {
      // cy.visitCatalog();
      vm.instanceCreate(testVM, false);
      cy.checkVMSpec(testVM.name, spec, runCmd, true);
    });

    it('ID(CNV-10323) activation key is not added to CentOS VM', () => {
      // cy.visitCatalog();
      vm.instanceCreate(testVM1, false);
      cy.checkVMSpec(testVM1.name, spec, runCmd, false);
    });

    xit('ID(CNV-11513) test predictive analytics subscription', () => {
      cy.visitVirtPerspectiveOverview();
      tab.navigateToSettings();
      cy.contains('Guest management').click();
      cy.contains('Automatic subscription').click();
      cy.get('.AutomaticSubscriptionType--main').find('button').click();
      cy.contains('Monitor and manage subscriptions').click();
      cy.get('#auto-update-rhel-vms').should('be.visible');
      cy.get('#auto-register-rhel').check();
      cy.get('.AutomaticSubscriptionCustomUrl--input').should('be.visible');
      cy.get('.AutomaticSubscriptionType--main').find('button').click();
      cy.contains('Enable predictive analytics').click();
      cy.get('#auto-register-rhel').should('be.disabled');
      cy.get('.AutomaticSubscriptionCustomUrl--input').should('not.be.visible');
      cy.get('#auto-register-rhel').should('be.disabled');
      cy.get('.AutomaticSubscriptionType--main').find('button').click();
      cy.contains('No subscription').click();
      cy.get('#auto-update-rhel-vms', { timeout: 10000 }).should('not.be.visible');
    });

    xit('ID(CNV-11513) predictive analysis is enabled', () => {
      cy.visitCatalog();
      cy.contains(iView.volName, testVM2.volume).click();
      cy.contains('U series').click();
      cy.contains('small: 1 CPUs, 2 GiB Memory').click();
      cy.get(iView.vmName).clear().type(testVM2.name);
      cy.byButtonText('Customize VirtualMachine').click();
      cy.contains('.pf-v5-c-tabs__item-text', 'Initial run').click();
      cy.get('[data-test-id="undefined-edit"]').click();
      cy.get('#editor-radio').check();
      cy.get('#editor-radio').should('contain', insClient);
      cy.clickCancelBtn();
      cy.byButtonText(iView.createBtnText).click();

      cy.checkVMSpec(testVM2.name, spec, insClient, true);
    });
  });

  describe('Test Enable guest system log access', () => {
    const spec = '.spec.virtualMachineOptions.disableSerialConsoleLog';

    const testVM2: VirtualMachineData = {
      name: 'verify-guest-log-disable-it',
      namespace: TEST_NS,
      startOnCreation: true,
      volume: 'rhel9',
    };
    const testVM3: VirtualMachineData = {
      diskSource: DiskSource.Default,
      name: 'verify-guest-log-disable-template',
      namespace: TEST_NS,
      startOnCreation: true,
      template: TEMPLATE.RHEL9,
    };

    before(() => {
      cy.deleteVM([testVM2, testVM3]);
    });

    after(() => {
      cy.deleteVM([testVM2, testVM3]);
    });

    it('ID(CNV-10788) enable guest system log', () => {
      cy.visitVirtPerspectiveOverview();
      tab.navigateToSettings();
      cy.contains('Guest management').click();
      cy.get('input[id="guest-system-log-access"]').check({ force: true });
    });

    it('ID(CNV-10788) verify guest log is enabled for instanceType VM', () => {
      vm.instanceCreate(testVM2);
      tab.navigateToDiagnostics();
      cy.wait(5000);
      cy.contains('Guest system log').click();
      cy.wait(5000);
      cy.get('input[aria-label="Search input"]').type('cloud-init');
      cy.get('input[id="wrap-text-checkbox"]').check();
      cy.deleteVM([testVM2]);
    });

    it('ID(CNV-10788) verify guest log is enabled for template VM', () => {
      vm.create(testVM3);
      tab.navigateToDiagnostics();
      cy.wait(5000);
      cy.contains('Guest system log').click();
      cy.wait(5000);
      cy.get('input[aria-label="Search input"]').type('cloud-init');
      cy.get('input[id="wrap-text-checkbox"]').check();
      cy.deleteVM([testVM3]);
    });

    it('ID(CNV-10788) verify the feature is enabled in hco', () => {
      cy.checkHCOSpec(spec, 'false', true);
    });

    it('ID(CNV-10788) delete VMs', () => {
      cy.deleteVM([testVM2, testVM3]);
    });

    it('ID(CNV-10788) disable guest system log', () => {
      cy.visitVirtPerspectiveOverview();
      tab.navigateToSettings();
      cy.contains('Guest management').click();
      cy.get('input[id="guest-system-log-access"]').uncheck({ force: true });
      cy.wait(5000);
    });

    it('ID(CNV-10788) verify guest log is disabled for instanceType VM', () => {
      vm.instanceCreate(testVM2);
      tab.navigateToDiagnostics();
      cy.wait(5000);
      cy.contains('Guest system log').click();
      cy.wait(5000);
      cy.contains('Guest system logs are disabled at cluster').should('exist');
      cy.deleteVM([testVM2]);
    });

    it('ID(CNV-10788) verify guest log is disabled for template VM', () => {
      vm.create(testVM3);
      tab.navigateToDiagnostics();
      cy.wait(5000);
      cy.contains('Guest system log').click();
      cy.wait(5000);
      cy.contains('Guest system logs are disabled at cluster').should('exist');
      cy.deleteVM([testVM3]);
    });

    it('ID(CNV-10788) verify the feature is disabled', () => {
      cy.checkHCOSpec(spec, 'true', true);
    });
  });
});
