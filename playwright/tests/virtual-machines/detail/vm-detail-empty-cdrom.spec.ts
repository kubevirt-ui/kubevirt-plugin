import { T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { TestTimeouts } from '@/utils/test-config';
import { withExampleVm } from '@/utils/with-example-vm';

test.describe(`VM storage empty CD-ROM ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T2_TAG}`, () => {
  test('Add empty CD-ROM from configuration storage (advanced CD-ROM preview)', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
    vmDetailTabsPage: tabs,
  }) => {
    await withExampleVm(apiClient, testNamespace, async (name) => {
      await vmDetail.openVm(testNamespace, name);
      await expect(vmDetail.overviewStatusWithText('Stopped')).toBeVisible({
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await tabs.openDisksTab(vmDetail);
      const cdRomRowsBefore = await tabs.cdRomStorageRow().count();
      const cdRomDiskName = await tabs.addEmptyCdRomFromConfigurationStorage();
      expect(cdRomDiskName.length).toBeGreaterThan(0);
      await expect(tabs.cdRomStorageRow()).toHaveCount(cdRomRowsBefore + 1);
      await expect
        .poll(
          async () => {
            const raw = await apiClient.getVirtualMachine(testNamespace, name);
            const vm = raw as unknown as {
              spec?: {
                template?: {
                  spec?: {
                    domain?: { devices?: { disks?: { cdrom?: unknown; name?: string }[] } };
                    volumes?: { name?: string }[];
                  };
                };
              };
            };
            const disks = vm?.spec?.template?.spec?.domain?.devices?.disks ?? [];
            const volumes = vm?.spec?.template?.spec?.volumes ?? [];
            const cdDisk = disks.find((disk) => disk.name === cdRomDiskName && disk.cdrom);
            if (!cdDisk) {
              return false;
            }
            return !volumes.some((volume) => volume.name === cdRomDiskName);
          },
          {
            message: `VirtualMachine ${name} should have empty CD-ROM device ${cdRomDiskName} (no volume)`,
            timeout: TestTimeouts.LONG_OPERATION,
          },
        )
        .toBe(true);
    });
  });
});
