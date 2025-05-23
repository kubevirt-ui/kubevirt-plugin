import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const PageTitles = {
  BootableVolumes: t('Bootable volumes'),
  Catalog: t('Catalog'),
  Checkups: t('Checkups'),
  VirtualMachineClusterInstanceTypes: t('VirtualMachineClusterInstanceTypes'),
  VirtualMachineInstanceTypes: t('VirtualMachineInstanceTypes'),
  VirtualMachines: t('VirtualMachines'),
};

export const getResourceDetailsTitle = (name: string, resourceKind: string) =>
  t('{{name}} · {{resourceKind}} · Details', { name, resourceKind });
