import { T1, T1_TAG, VM_ACTIONS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/templates-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import {
  setupTemplateFromResource,
  verifyTemplateDeletedFromCluster,
} from '@/utils/template-test-helpers';

const SUITE_TEST_VM_FROM_EXAMPLE_TEMPLATE = 'Test VM from example template';
const SUITE_TEMPLATE_LIFECYCLE = 'Template lifecycle';

const lifecycleDedicatedTemplateFields = {
  displayName: 'Lifecycle Test Template',
  description: 'Template for lifecycle testing with dedicated resources',
  workload: 'highperformance' as const,
  workloadLabel: 'highperformance',
  dedicatedCpuPlacement: true,
  evictionStrategy: 'LiveMigrate' as const,
};

test.describe.serial('Tier1 Template Tests', { tag: [T1_TAG, '@tier1-templates'] }, () => {
  let sharedNs: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    sharedNs = await setupTestNamespace(apiClient, 'templates-shared');
  });

  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({
      suite: SUITE_TEST_VM_FROM_EXAMPLE_TEMPLATE,
      feature: T1,
      tags: [T1_TAG, VM_ACTIONS_TAG],
    });
  });

  test('Template can be created from an example template and is shown in the list', async ({
    apiClient,
    pageCommons,
    templatesPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    const templateName = utils.generateRandomTemplateName('example');
    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.clickCreateTemplate();
    await templatesPage.setCreateTemplateExampleNameInYamlEditor(templateName);
    await templatesPage.clickCreateButtonInModal();

    apiClient.trackResource('Template', templateName, sharedNs);

    const templateDetailsVerified =
      await templatesPage.verifyTemplateCreationFromExample('Template details');
    expect.soft(templateDetailsVerified, 'Template details should be visible').toBe(true);

    const fedoraVmVerified = await templatesPage.verifyTemplateCreationFromExample('Fedora VM');
    expect.soft(fedoraVmVerified, 'Fedora VM should be visible').toBe(true);
  });

  test('VM created from a template example starts successfully and reaches Running state', async ({
    apiClient,
    pageCommons,
    templatesPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    const { templateName } = await setupTemplateFromResource(
      apiClient,
      'fedora-template-merge',
      {
        targetNamespace: sharedNs,
        displayName: utils.TEMPLATE_DISPLAY_NAMES.FEDORA,
        description: 'Fedora VM template for testing',
      },
      utils,
    );
    const templateExists = await apiClient.verifyTemplateCreated(templateName, sharedNs);
    expect.soft(templateExists.exists, `Template ${templateName} should be created`).toBe(true);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);

    const vmName = utils.generateRandomVmName('vm-from-template-example');
    await apiClient.createVmFromTemplate(templateName, vmName, sharedNs, sharedNs, true);
    apiClient.trackResource('VirtualMachine', vmName, sharedNs);
    await apiClient.waitForVmRunning(vmName, sharedNs, utils.TestTimeouts.VM_BOOTUP);

    const verifyResult = await apiClient.verifyVmCreated(
      vmName,
      sharedNs,
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect.soft(verifyResult.exists, 'VM should be created').toBe(true);
  });

  test('VM creation wizard allows specifying a custom rootdisk name', async ({
    apiClient,
    pageCommons,
    templatesPage,
    templateDetailPage,
    utils,
  }) => {
    const customDiskName = 'custom-boot';
    const vmName = utils.generateRandomVmName('vm-custom-disk');
    const created = await setupTemplateFromResource(
      apiClient,
      'custom-disk-tpl',
      {
        targetNamespace: sharedNs,
        displayName: 'Custom Boot Disk Template',
        description: 'Template with renamed rootdisk to validate CNV-83098 fix',
        rootDiskName: customDiskName,
      },
      utils,
    );
    const templateName = created.templateName;
    const templateExists = await apiClient.verifyTemplateCreated(templateName, sharedNs);
    expect.soft(templateExists.exists, `Template ${templateName} should be created`).toBe(true);

    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    await templatesPage.clickTemplateByTestId(templateName);

    await templateDetailPage.navigateToDisks();

    const diskVisible = await templateDetailPage.verifyDiskNameVisible(customDiskName);
    expect
      .soft(diskVisible, `Custom disk "${customDiskName}" should be visible on Disks tab`)
      .toBe(true);

    await apiClient.createVmFromTemplate(templateName, vmName, sharedNs, sharedNs, true);
    apiClient.trackResource('VirtualMachine', vmName, sharedNs);
    const verifyResult = await apiClient.verifyVmCreated(
      vmName,
      sharedNs,
      utils.TestTimeouts.VM_CREATION,
    );
    expect
      .soft(
        verifyResult.exists,
        `VM ${vmName} should be created from template with custom rootdisk (CNV-83098)`,
      )
      .toBe(true);
  });

  test('User template CPU and memory can be edited and saved via the details page', async ({
    apiClient,
    pageCommons,
    templatesPage,
    templateDetailPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    const { templateName } = await setupTemplateFromResource(
      apiClient,
      'cpu-edit-tpl',
      {
        targetNamespace: sharedNs,
        displayName: 'Resource Edit Test Template',
        description: 'Template for testing compute resource editing',
      },
      utils,
    );
    const templateCreated = await apiClient.verifyTemplateCreated(templateName, sharedNs);
    expect.soft(templateCreated.exists, `Template ${templateName} should be created`).toBe(true);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    await templatesPage.clickTemplateByTestId(templateName);

    await templateDetailPage.editDetails({ cpu: '4', mem: '8' });

    const cpuMemVerified = await templateDetailPage.verifyCpuMemory('4', '8');
    expect.soft(cpuMemVerified, 'Template should show updated CPU=4, Memory=8 GiB').toBe(true);
  });
});

test.describe.serial(SUITE_TEMPLATE_LIFECYCLE, { tag: [T1_TAG, '@tier1-templates'] }, () => {
  let sharedNs: string;

  test.beforeAll(async ({ apiClient, utils }) => {
    sharedNs = await setupTestNamespace(apiClient, 'tpl-lifecycle-shared');
  });

  test.beforeEach(async ({ utils }) => {
    await utils.withAllure({
      suite: SUITE_TEMPLATE_LIFECYCLE,
      feature: T1,
      tags: [T1_TAG, VM_ACTIONS_TAG],
    });
  });

  test('Template created with dedicated CPU resources is reflected in k8s spec', async ({
    apiClient,
    pageCommons,
    templatesPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    await templatesPage.navigateToTemplatesViaUI();
    const templateName = utils.generateRandomTemplateName('dedicated-tpl');

    await setupTemplateFromResource(
      apiClient,
      'dedicated-tpl',
      {
        name: templateName,
        targetNamespace: sharedNs,
        ...lifecycleDedicatedTemplateFields,
      },
      utils,
    );

    const templateExists = await apiClient.verifyTemplateCreated(templateName, sharedNs);
    expect.soft(templateExists.exists, `Template ${templateName} should exist in k8s`).toBe(true);
  });

  test('VM created from template with dedicated resources starts with CPU pinning enabled', async ({
    apiClient,
    pageCommons,
    vmListPage,
    vmDetailPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    const templateName = utils.generateRandomTemplateName('vm-source-tpl');
    const vmName = utils.generateRandomVmName('vm-dedicated');

    await setupTemplateFromResource(
      apiClient,
      'vm-source-tpl',
      {
        name: templateName,
        targetNamespace: sharedNs,
        ...lifecycleDedicatedTemplateFields,
      },
      utils,
    );

    const templateExists = await apiClient.verifyTemplateCreated(templateName, sharedNs);
    expect
      .soft(templateExists.exists, `Template ${templateName} should be created for test setup`)
      .toBe(true);

    await apiClient.createVmFromTemplate(templateName, vmName, sharedNs, sharedNs, true);
    apiClient.trackResource('VirtualMachine', vmName, sharedNs);

    const k8sVerifyResult = await apiClient.verifyVmCreated(
      vmName,
      sharedNs,
      utils.TestTimeouts.VM_BOOTUP,
    );
    expect.soft(k8sVerifyResult.exists, `VM ${vmName} should be created (k8s)`).toBe(true);

    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmListPage.searchTreeView(sharedNs);
    await vmListPage.clickTreeNodeAndEnsureExpanded(sharedNs, vmName, sharedNs);
    await vmListPage.clickVmInTreeView(vmName, sharedNs);

    const isVmVisible = await vmDetailPage.isVmNameVisible(vmName);
    expect.soft(isVmVisible, `VM ${vmName} should be visible in UI`).toBe(true);

    await vmDetailPage.navigateToConfigurationDetails();
    const workloadVerified = await vmDetailPage.verifyWorkload(
      vmName,
      utils.WORKLOAD_TYPES.HIGH_PERFORMANCE,
    );
    expect.soft(workloadVerified, 'VM workload should match template configuration').toBe(true);

    await vmDetailPage.navigateToConfigurationScheduling();
    const schedulingVerified = await vmDetailPage.verifyDedicatedResources(
      'Workload scheduled with dedicated resources (guaranteed policy)',
    );
    expect.soft(schedulingVerified, 'Dedicated resources should be configured').toBe(true);

    const rootDiskVisible = await vmDetailPage.verifyDiskRowVisibleByExactDataTestId(
      `disk-${utils.DISK_NAMES.ROOT}`,
    );
    expect
      .soft(rootDiskVisible, 'Root disk row should be visible (data-test-id disk-rootdisk)')
      .toBe(true);
  });

  test('User template can be deleted via the UI and is removed from the list', async ({
    apiClient,
    pageCommons,
    templatesPage,
    utils,
  }) => {
    if (!utils.EnvVariables.onAcm) {
      await pageCommons.switchProject(sharedNs);
    }

    const templateName = utils.generateRandomTemplateName('delete-tpl');

    await setupTemplateFromResource(
      apiClient,
      'delete-tpl',
      {
        name: templateName,
        targetNamespace: sharedNs,
        ...lifecycleDedicatedTemplateFields,
      },
      utils,
    );

    const templateExists = await apiClient.verifyTemplateCreated(templateName, sharedNs);
    expect
      .soft(templateExists.exists, `Template ${templateName} should be created for test setup`)
      .toBe(true);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    await templatesPage.deleteTemplate();
    await templatesPage.waitForTemplateRowDetached(templateName);

    await templatesPage.navigateToTemplatesViaUI();
    await templatesPage.filterTemplatesByName(templateName);
    const isEmptyVisible = await templatesPage.isEmptyMessageVisible();
    expect
      .soft(isEmptyVisible, 'Empty message should be visible after deleting template')
      .toBe(true);

    const k8sDeleteResult = await verifyTemplateDeletedFromCluster(
      apiClient,
      templateName,
      sharedNs,
      utils,
    );
    expect
      .soft(k8sDeleteResult.deleted, `Template ${templateName} should be deleted from cluster`)
      .toBe(true);
  });
});
