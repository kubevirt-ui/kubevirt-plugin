import produce from 'immer';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { ensurePath, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import {
  DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE,
  VIRTIO_WIN_CONFIG_MAP_NAME,
  VIRTIO_WIN_CONFIG_MAP_NAMESPACES,
  VIRTIO_WIN_IMAGE,
  WINDOWS_DRIVERS_DISK,
} from './constants';

const getVirtioWinConfigMap = async (): Promise<any> => {
  let lastException = undefined;
  for (const namespace of VIRTIO_WIN_CONFIG_MAP_NAMESPACES) {
    try {
      const configMap = await k8sGet({
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

export const getDriversImage = async (): Promise<string> => {
  const driversImage = DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE;
  try {
    const configMap = await getVirtioWinConfigMap();
    if (configMap?.data?.[VIRTIO_WIN_IMAGE]) return configMap.data[VIRTIO_WIN_IMAGE];
  } catch (error) {
    kubevirtConsole.error(error);
  }

  return driversImage;
};

export const mountWinDriversToVM = async (vm: V1VirtualMachine): Promise<V1VirtualMachine> => {
  const driversImage = await getDriversImage();

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
        image: driversImage,
      },
      name: WINDOWS_DRIVERS_DISK,
    });
  });
};
