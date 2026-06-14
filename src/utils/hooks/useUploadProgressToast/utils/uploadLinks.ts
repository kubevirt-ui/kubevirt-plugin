import { TFunction } from 'i18next';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { getName, getNamespace, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMURL } from '@multicluster/urls';

import { UploadSuccessLink } from './types';

export const getVmStorageUrl = (vm: V1VirtualMachine): string => {
  const cluster = getCluster(vm);
  const namespace = getNamespace(vm);
  const vmName = getName(vm);

  return `${getVMURL(cluster, namespace, vmName)}/${VirtualMachineDetailsTab.Configurations}/${
    VirtualMachineDetailsTab.Storage
  }`;
};

const getDataVolumeUrl = (dataVolumeName: string, namespace: string): string =>
  getResourceUrl({
    model: DataVolumeModel,
    resource: { metadata: { name: dataVolumeName, namespace } },
  });

export const getVmCdromUploadContextLinks = (
  t: TFunction,
  vm: V1VirtualMachine,
): UploadSuccessLink[] => [
  {
    label: t('View {{name}} storage', { name: getName(vm) }),
    url: getVmStorageUrl(vm),
  },
];

export const getVmDiskUploadSuccessLinks = (
  t: TFunction,
  vm: V1VirtualMachine,
  diskName: string,
  dataVolumeName: string,
  isCdrom = false,
): UploadSuccessLink[] => {
  if (isCdrom) {
    return getVmCdromUploadContextLinks(t, vm);
  }

  const namespace = getNamespace(vm);

  return [
    {
      label: t('View disk {{name}}', { name: diskName }),
      url: getVmStorageUrl(vm),
    },
    {
      label: t('View DataVolume {{name}}', { name: dataVolumeName }),
      url: getDataVolumeUrl(dataVolumeName, namespace),
    },
  ];
};
