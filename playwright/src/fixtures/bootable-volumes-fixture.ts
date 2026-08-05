/**
 * Bootable Volumes test fixture.
 *
 * Provides page objects shared across bootable-volumes specs.
 *
 * Usage:
 *   import { test, expect } from '@/fixtures/bootable-volumes-fixture';
 */

import BootableVolumeDetailPage from '@/page-objects/create-vm/bootable-volume-detail-page';
import BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import CreateVmPage from '@/page-objects/create-vm/create-vm-page';
import VirtualMachineDetailPage from '@/page-objects/vm/virtual-machine-detail-page';
import VirtualMachinesPage from '@/page-objects/vm/virtual-machines-page';

import { baseTest, expect } from './scenario-test-fixture';

interface BootableVolumesFixtures {
  bootableVolumesPage: BootableVolumesPage;
  bootableVolumeDetailPage: BootableVolumeDetailPage;
  createVmPage: CreateVmPage;
  vmDetailPage: VirtualMachineDetailPage;
  vmListPage: VirtualMachinesPage;
}

const test = baseTest.extend<BootableVolumesFixtures>({
  bootableVolumesPage: async ({ page }, use) => {
    await use(new BootableVolumesPage(page));
  },
  bootableVolumeDetailPage: async ({ page }, use) => {
    await use(new BootableVolumeDetailPage(page));
  },
  createVmPage: async ({ page }, use) => {
    await use(new CreateVmPage(page));
  },
  vmDetailPage: async ({ page }, use) => {
    await use(new VirtualMachineDetailPage(page));
  },
  vmListPage: async ({ page }, use) => {
    await use(new VirtualMachinesPage(page));
  },
});

export { expect, test };
