import { expect, test as base } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import {
  BootableVolumesPage,
  CheckupsPage,
  InstanceTypesPage,
  MigrationPoliciesPage,
  StorageClassesPage,
} from '../pages/ResourceListPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { VMDetailsPage } from '../pages/VMDetailsPage';
import { VMListPage } from '../pages/VMListPage';

type KubevirtFixtures = {
  bootableVolumesPage: BootableVolumesPage;
  checkupsPage: CheckupsPage;
  instanceTypesPage: InstanceTypesPage;
  loginPage: LoginPage;
  migrationPoliciesPage: MigrationPoliciesPage;
  settingsPage: SettingsPage;
  storageClassesPage: StorageClassesPage;
  templatesPage: TemplatesPage;
  vmDetails: VMDetailsPage;
  vmList: VMListPage;
};

export const test = base.extend<KubevirtFixtures>({
  bootableVolumesPage: async ({ page }, use) => {
    await use(new BootableVolumesPage(page));
  },

  checkupsPage: async ({ page }, use) => {
    await use(new CheckupsPage(page));
  },

  instanceTypesPage: async ({ page }, use) => {
    await use(new InstanceTypesPage(page));
  },

  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.seedGuidedTourState();
    await use(lp);
  },

  migrationPoliciesPage: async ({ page }, use) => {
    await use(new MigrationPoliciesPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  storageClassesPage: async ({ page }, use) => {
    await use(new StorageClassesPage(page));
  },

  templatesPage: async ({ page }, use) => {
    await use(new TemplatesPage(page));
  },

  vmDetails: async ({ page }, use) => {
    await use(new VMDetailsPage(page));
  },

  vmList: async ({ page }, use) => {
    await use(new VMListPage(page));
  },
});

export { expect };
