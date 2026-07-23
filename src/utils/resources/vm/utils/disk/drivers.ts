import produce from 'immer';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { ensurePath, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import {
  DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE,
  VIRTIO_WIN_CONFIG_MAP_NAME,
  VIRTIO_WIN_CONFIG_MAP_NAMESPACES,
  VIRTIO_WIN_IMAGE,
  VIRTIO_WIN_IMAGE_DOWNLOAD_URL,
  WINDOWS_DRIVERS_DISK,
} from './constants';

const getVirtioWinConfigMap = async (cluster?: string): Promise<any> => {
  let lastException = undefined;
  for (const namespace of VIRTIO_WIN_CONFIG_MAP_NAMESPACES) {
    try {
      const configMap = await kubevirtK8sGet({
        cluster,
        model: ConfigMapModel,
        name: VIRTIO_WIN_CONFIG_MAP_NAME,
        ns: namespace,
      });

      if (configMap) {
        return configMap;
      }
    } catch (e) {
      kubevirtConsole.error(
        `The ${VIRTIO_WIN_CONFIG_MAP_NAME} can not be found in the ${namespace} namespace.  Another namespace will be queried, if any left. Error: `,
        e,
      );
      lastException = e;
    }
  }

  throw lastException;
};

export type VirtioWinDriversInfo = {
  downloadURL?: string;
  image: string;
};

export const DEFAULT_INFO: VirtioWinDriversInfo = { image: DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE };

export const getDriversInfo = async (cluster?: string): Promise<VirtioWinDriversInfo> => {
  try {
    const configMap = await getVirtioWinConfigMap(cluster);

    return {
      downloadURL: configMap?.data?.[VIRTIO_WIN_IMAGE_DOWNLOAD_URL] || undefined,
      image: configMap?.data?.[VIRTIO_WIN_IMAGE] || DEFAULT_INFO.image,
    };
  } catch (error) {
    kubevirtConsole.error(error);
  }

  return DEFAULT_INFO;
};

export const getDriversImage = async (cluster?: string): Promise<string> => {
  const info = await getDriversInfo(cluster);
  return info.image;
};

export const addWinDriverVolume = (vm: V1VirtualMachine, driverImage: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices']);

    if (!draftVM.spec.template.spec.domain.devices.disks)
      draftVM.spec.template.spec.domain.devices.disks = [];

    if (!draftVM.spec.template.spec.volumes) draftVM.spec.template.spec.volumes = [];

    draftVM.spec.template.spec.domain.devices.disks.push({
      cdrom: {
        bus: InterfaceTypes.SATA,
      },
      name: WINDOWS_DRIVERS_DISK,
    });

    draftVM.spec.template.spec.volumes.push({
      containerDisk: {
        image: driverImage,
      },
      name: WINDOWS_DRIVERS_DISK,
    });
  });
};

export const mountWinDriversToVM = async (vm: V1VirtualMachine): Promise<V1VirtualMachine> => {
  const driversImage = await getDriversImage(getCluster(vm));

  return addWinDriverVolume(vm, driversImage);
};
