import type { TFunction } from 'i18next';

export const getEmptyStateDescription = (
  isAllProjectsScope: boolean,
  canCreateVMInProject: boolean,
  t: TFunction,
): string => {
  if (isAllProjectsScope) {
    return t('To get started, select or create a project, then create a VirtualMachine.');
  }

  if (canCreateVMInProject) {
    return t(
      'To get started, create a VirtualMachine or view the Catalog tab to create a VirtualMachine from the available options.',
    );
  }

  return t('To create a VirtualMachine, contact an administrator.');
};
