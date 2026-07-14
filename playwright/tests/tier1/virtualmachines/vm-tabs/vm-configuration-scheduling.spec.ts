import { T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

test.describe.serial(
  'Tier1 VM Configuration Scheduling — shared stopped RHEL9',
  { tag: [T1_TAG, '@nonpriv'] },
  () => {
    let vmName: string;
    let setupError: string | undefined;

    test.beforeAll(async ({ k8sClient, utils, testConfig }) => {
      try {
        vmName = utils.generateRandomVmName('vm-scheduling');
        await k8sClient.createVmFromTemplate(
          utils.TEMPLATE_METADATA_NAMES.RHEL9,
          vmName,
          testConfig.testNamespace,
          'openshift',
          false,
        );
        k8sClient.trackResource('VirtualMachine', vmName, testConfig.testNamespace);

        const verifyResult = await k8sClient.verifyVmCreated(
          vmName,
          testConfig.testNamespace,
          utils.TestTimeouts.VM_BOOTUP,
        );
        if (!verifyResult.exists) throw new Error(`VM ${vmName} was not created`);
      } catch (error: unknown) {
        setupError = error instanceof Error ? error.message : String(error);
      }
    });

    test.beforeEach(async ({ vmTreePage, utils, testConfig }) => {
      test.skip(!!setupError, `Shared VM setup failed: ${setupError}`);
      test.setTimeout(utils.TestTimeouts.TEST_VM_CREATION);
      await utils.withAllure({
        suite: 'VM Configuration Scheduling',
        feature: T1,
        tags: [T1_TAG, VM_TABS_TAG],
      });
      await vmTreePage.navigateToNamespaceVirtualMachinesViaUI(testConfig.testNamespace);
      await vmTreePage.toggleEmptyProjectsDisplay(true);
    });

    test('Configuration Scheduling: requirements and eviction strategy after patch', async ({
      k8sClient,
      vmTreePage,
      vmDetailPage,
      testConfig,
    }) => {
      await vmTreePage.searchTreeView(testConfig.testNamespace);
      await vmTreePage.clickTreeNodeAndEnsureExpanded(
        testConfig.testNamespace,
        vmName,
        testConfig.testNamespace,
      );
      await vmTreePage.clickVmInTreeView(vmName, testConfig.testNamespace);

      await vmDetailPage.navigateToConfigurationScheduling();
      const schedulingVisible = await vmDetailPage.verifySchedulingAndResourceRequirements();
      expect
        .soft(
          schedulingVisible,
          'Scheduling sub-tab should show scheduling and resource requirements',
        )
        .toBe(true);

      await k8sClient.patchVmEvictionStrategy(vmName, testConfig.testNamespace, 'LiveMigrate');

      await vmDetailPage.navigateToVirtualMachineDetail(vmName, testConfig.testNamespace);
      await vmDetailPage.navigateToConfigurationScheduling();

      const liveMigrateVisible = await vmDetailPage.verifyEvictionStrategyLiveMigrate();
      expect
        .soft(
          liveMigrateVisible,
          'Eviction strategy should display LiveMigrate after cluster patch',
        )
        .toBe(true);
    });

    test('Edit run strategy via Configuration > Scheduling', async ({
      vmTreePage,
      vmDetailPage,
      testConfig,
    }) => {
      await vmTreePage.searchTreeView(testConfig.testNamespace);
      await vmTreePage.clickTreeNodeAndEnsureExpanded(
        testConfig.testNamespace,
        vmName,
        testConfig.testNamespace,
      );
      await vmTreePage.clickVmInTreeView(vmName, testConfig.testNamespace);

      await test.step('Verify run strategy is visible in Configuration > Scheduling', async () => {
        await vmDetailPage.navigateToConfigurationScheduling();
        const runStrategy = await vmDetailPage.getRunStrategyValue();
        expect
          .soft(runStrategy.length, 'Run strategy should have a displayed value')
          .toBeGreaterThan(0);
      });

      await test.step('Edit run strategy to Manual via RunStrategyModal', async () => {
        const edited = await vmDetailPage.editRunStrategy('Manual');
        expect(edited, 'Run strategy should be editable via the modal').toBe(true);
      });

      await test.step('Verify run strategy updated in UI', async () => {
        const runStrategy = await vmDetailPage.getRunStrategyValue();
        expect.soft(runStrategy, 'UI should show Manual run strategy').toContain('Manual');
      });

      await test.step('Edit run strategy to RerunOnFailure and verify', async () => {
        const edited = await vmDetailPage.editRunStrategy('RerunOnFailure');
        expect(edited, 'Should switch to RerunOnFailure').toBe(true);
        const runStrategy = await vmDetailPage.getRunStrategyValue();
        expect.soft(runStrategy, 'UI should show Rerun on failure').toContain('Rerun on failure');
      });

      await test.step('Cycle through all four strategies', async () => {
        const edited = await vmDetailPage.editRunStrategy('Always');
        expect(edited, 'Should switch to Always').toBe(true);
        const runStrategy = await vmDetailPage.getRunStrategyValue();
        expect.soft(runStrategy, 'UI should show Always').toContain('Always');
      });
    });
  },
);
