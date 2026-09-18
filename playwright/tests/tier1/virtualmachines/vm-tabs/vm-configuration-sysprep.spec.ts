import { ADMIN_ONLY_TAG, T1, T1_TAG, VM_TABS_TAG } from '@/data-models/allure-constants';
import SysprepModalComponent from '@/components/sysprep/sysprep-modal-component';
import { expect, test } from '@/fixtures/vm-tabs-fixture';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';
import { getVmSysprepConfigMapName } from '@/utils/sysprep-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'VM Configuration — Sysprep';

test.describe(SUITE, { tag: [T1_TAG, ADMIN_ONLY_TAG] }, () => {
  test('Windows VM sysprep can be created, detached, and attached from existing', async ({
    apiClient,
    vmListPage,
    vmDetailPage,
    page,
    utils,
  }) => {
    test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, VM_TABS_TAG, ADMIN_ONLY_TAG],
    });

    const namespace = await setupTestNamespace(apiClient, 'sysprep-vm');
    const vmName = utils.generateRandomVmName('win-sysprep');
    const sysprepModal = new SysprepModalComponent(page);

    await test.step('Create a stopped Windows VM', async () => {
      await apiClient.createVmFromTemplate(
        TEMPLATE_METADATA_NAMES.WIN11,
        vmName,
        namespace,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, namespace);
    });

    await test.step('Navigate to Configuration → Initial run', async () => {
      await vmListPage.navigateToVmViaTreeView(namespace, vmName);
      await vmDetailPage.navigateToConfigurationInitialRun();
    });

    let createdSysprepName = '';

    await test.step('Create new sysprep, detach it, then attach from existing', async () => {
      createdSysprepName = await sysprepModal.runCreateDetachAttachFlow();
      expect(createdSysprepName.length, 'Sysprep ConfigMap name should be visible').toBeGreaterThan(
        0,
      );
    });

    await test.step('Verify VM spec references the sysprep ConfigMap', async () => {
      const vm = await apiClient.getVirtualMachine(namespace, vmName);
      expect(getVmSysprepConfigMapName(vm), 'VM should reference the attached sysprep ConfigMap').toBe(
        createdSysprepName,
      );
    });
  });
});
