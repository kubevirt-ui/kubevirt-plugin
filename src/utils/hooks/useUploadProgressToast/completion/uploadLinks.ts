import type { TFunction } from 'i18next';

import {
  DataSourceModel,
  DataVolumeModel,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { appendBootableVolumeContext } from '@kubevirt-utils/resources/bootableresources/constants';
import { getName, getNamespace, getResourceUrl, getUID } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { getFleetBootableVolumesURL, getMulticlusterSearchURL, getVMURL } from '@multicluster/urls';

import type { UploadSuccessLink } from '../types';

import { getUploadLinkedResource } from './uploadLinkedResource';

export const getVmStorageUrlForIdentity = (
  cluster: string | undefined,
  namespace: string,
  vmName: string,
): string =>
  `${getVMURL(cluster, namespace, vmName)}/${VirtualMachineDetailsTab.Configurations}/${
    VirtualMachineDetailsTab.Storage
  }`;

export const getVmStorageUrl = (vm: V1VirtualMachine): string =>
  getVmStorageUrlForIdentity(getCluster(vm), getNamespace(vm), getName(vm));

export const omitLinksByUrl = (
  links: UploadSuccessLink[] | undefined,
  urlsToOmit: Set<string>,
): UploadSuccessLink[] | undefined => {
  if (!links) {
    return links;
  }

  const filtered = links.filter((link) => !urlsToOmit.has(link.url));
  return filtered.length === links.length ? links : filtered;
};

export const getDataVolumeUrl = (
  dataVolumeName: string,
  namespace: string,
  cluster?: string,
): string =>
  cluster && namespace
    ? getMulticlusterSearchURL(DataVolumeModel, dataVolumeName, namespace, cluster)
    : getResourceUrl({
        model: DataVolumeModel,
        resource: { metadata: { name: dataVolumeName, namespace } },
      });

export const getBootableVolumeUrl = (name: string, namespace?: string, cluster?: string): string =>
  appendBootableVolumeContext(
    cluster && namespace
      ? getMulticlusterSearchURL(DataSourceModel, name, namespace, cluster)
      : getResourceUrl({
          model: DataSourceModel,
          resource: { metadata: { name, namespace } },
        }),
  );

export const getBootableVolumesListUrl = (namespace: string, cluster?: string): string =>
  cluster ? getFleetBootableVolumesURL(cluster, namespace) : `/k8s/ns/${namespace}/bootablevolumes`;

const isVmAlive = (vm: V1VirtualMachine): boolean =>
  Boolean(getUID(vm) && !vm.metadata?.deletionTimestamp);

const getVmStorageLink = (
  label: UploadSuccessLink['label'],
  vm: V1VirtualMachine,
): UploadSuccessLink => ({
  label,
  resource: getUploadLinkedResource(
    VirtualMachineModel,
    getName(vm) ?? '',
    getNamespace(vm),
    getCluster(vm),
  ),
  url: getVmStorageUrl(vm),
});

export const getBootableVolumeContextLink = (
  t: TFunction,
  name: string,
  namespace: string,
  cluster?: string,
): UploadSuccessLink => ({
  label: t('Uploading Bootable volume {{name}}', { name }),
  url: getBootableVolumesListUrl(namespace, cluster),
});

export const getBootableVolumeSuccessLink = (
  t: TFunction,
  name: string,
  namespace?: string,
  cluster?: string,
): UploadSuccessLink => ({
  label: t('View bootable volume {{name}}', { name }),
  resource: getUploadLinkedResource(DataSourceModel, name, namespace, cluster),
  url: getBootableVolumeUrl(name, namespace, cluster),
});

export const getVmCdromUploadContextLinks = (
  t: TFunction,
  vm: V1VirtualMachine,
): UploadSuccessLink[] => {
  if (!isVmAlive(vm)) {
    return [];
  }

  return [getVmStorageLink(t('View {{name}} storage', { name: getName(vm) }), vm)];
};

export const getVmDiskUploadSuccessLinks = (
  t: TFunction,
  vm: V1VirtualMachine,
  diskName: string,
  dataVolumeName: string,
  isCdrom = false,
  isDataVolumeAlive = true,
): UploadSuccessLink[] => {
  if (isCdrom) {
    return getVmCdromUploadContextLinks(t, vm);
  }

  const links: UploadSuccessLink[] = [];

  if (isVmAlive(vm)) {
    links.push(getVmStorageLink(t('View disk {{name}}', { name: diskName }), vm));
  }

  const namespace = getNamespace(vm);
  if (isDataVolumeAlive && dataVolumeName && namespace) {
    links.push({
      label: t('View DataVolume {{name}}', { name: dataVolumeName }),
      resource: getUploadLinkedResource(DataVolumeModel, dataVolumeName, namespace, getCluster(vm)),
      url: getDataVolumeUrl(dataVolumeName, namespace, getCluster(vm)),
    });
  }

  return links;
};
