import { produceVMDisks } from '@catalog/utils/WizardVMContext/utils/vm-produce';
import { ConfigMapModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
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
      console.error(
        `The ${VIRTIO_WIN_CONFIG_MAP_NAME} can not be found in the ${namespace} namespace.  Another namespace will be queried, if any left. Error: `,
        e,
      );
      lastException = e;
    }
  }

  throw lastException;
};

export const mountWinDriversToTemplate = async (template: V1Template): Promise<V1Template> => {
  let driversImage = DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE;

  try {
    const configMap = await getVirtioWinConfigMap();
    if (configMap?.data?.[VIRTIO_WIN_IMAGE]) driversImage = configMap.data[VIRTIO_WIN_IMAGE];
  } catch (error) {
    console.error(error);
  }

  const virtualMachine = getTemplateVirtualMachineObject(template);

  template.objects[0] = produceVMDisks(virtualMachine, (draftVM) => {
    draftVM.spec.template.spec.domain.devices.disks.push({
      name: WINDOWS_DRIVERS_DISK,
      cdrom: {
        bus: 'sata',
      },
    });

    draftVM.spec.template.spec.volumes.push({
      name: WINDOWS_DRIVERS_DISK,
      containerDisk: {
        image: driversImage,
      },
    });
  });

  return template;
};
