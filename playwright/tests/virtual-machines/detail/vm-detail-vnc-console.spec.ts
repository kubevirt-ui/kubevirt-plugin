import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM detail VNC console ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test('Running VM overview shows VNC console and Open web console link', async ({
    apiClient,
    page,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    const name = CRUD_NAMES.vmExample;
    await apiClient.deleteVirtualMachine(name, testNamespace);
    await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    await apiClient.applyVirtualMachineExample(testNamespace, name);

    try {
      await vmDetail.openVmAndWaitForDetail(testNamespace, name);
      // Prefer API start — Actions → Start is flaky under LazyActionMenu access checks on
      // congested clusters; the gating assertion is VNC UI once Running, not the Start CTA.
      try {
        await apiClient.startVirtualMachine(testNamespace, name);
      } catch {
        await vmDetail.startVmFromActions();
      }
      await expect(vmDetail.overviewStatusWithText('Running')).toBeVisible({
        timeout: TestTimeouts.TEST_VM_CREATION,
      });

      await expect(vmDetail.overviewVncConsoleTitle()).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await vmDetail.ensureOverviewVncConnected();
      await expect(vmDetail.openWebConsoleButton()).toBeEnabled();

      const standalone = await vmDetail.openWebConsoleStandalonePage();
      await expect(standalone).toHaveURL(/\/console\/standalone/, {
        timeout: TestTimeouts.LONG_OPERATION,
      });
      if (standalone !== page) {
        await standalone.close();
      } else {
        await vmDetail.openVm(testNamespace, name);
      }
    } finally {
      await apiClient.deleteVirtualMachine(name, testNamespace);
      await apiClient.deleteOpenshiftTemplate(name, testNamespace);
    }
  });
});
