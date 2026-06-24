import { createAdvancedSearchTestVms } from '@/utils/test-setup-helpers';
import {
  createVmFromTemplateCatalogFlow,
  createVmFromTemplateInNamespace,
  navigateToProjectVmListForNamespace,
  navigateToProjectVmListViaUI,
  navigateToVirtualMachinesWithEmptyProjectsInTree,
  setupPwTestNamespace,
} from '@/utils/vm-actions-direct-k8s';
import {
  navigateToVmDetailAndConfigurationSubTab,
  verifyCloudInitWithRetries,
} from '@/utils/vm-navigation-helpers';

export const navigation = {
  toVmDetailConfig: navigateToVmDetailAndConfigurationSubTab,
  toProjectVmList: navigateToProjectVmListViaUI,
  toProjectVmListForNs: navigateToProjectVmListForNamespace,
  toVmTreeWithEmptyProjects: navigateToVirtualMachinesWithEmptyProjectsInTree,
  verifyCloudInit: verifyCloudInitWithRetries,
  setupTestNamespace: setupPwTestNamespace,
  createVmFromCatalog: createVmFromTemplateCatalogFlow,
  createVmFromTemplate: createVmFromTemplateInNamespace,
  createAdvancedSearchVms: createAdvancedSearchTestVms,
};

export type NavigationFixture = typeof navigation;
