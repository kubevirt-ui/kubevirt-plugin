import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  AUTOUNATTEND,
  generateNewSysprepConfig,
  SYSPREP,
  sysprepDisk,
  sysprepVolume,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const patchVMWithExistingSysprepConfigMap = async (
  name: string,
  vm: V1VirtualMachine,
): Promise<void> => {
  const vmVolumes = getVolumes(vm);
  const vmDisks = getDisks(vm);

  await k8sPatch<V1VirtualMachine>({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks`,
        value: [
          ...vmDisks.filter((disk) => disk?.name !== SYSPREP),
          ...(!isEmpty(name) ? [sysprepDisk()] : []),
        ],
      },
      {
        op: 'replace',
        path: `/spec/template/spec/volumes`,
        value: [
          ...vmVolumes.filter((vol) => vol?.name !== SYSPREP),
          ...(!isEmpty(name) ? [sysprepVolume(name)] : []),
        ],
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });
};

export const createSysprepConfigMap = async (
  unattended: string,
  autounattend: string,
  externalSysprepConfig: IoK8sApiCoreV1ConfigMap,
  vm: V1VirtualMachine,
): Promise<void> => {
  const vmVolumes = getVolumes(vm);
  const vmDisks = getDisks(vm);

  const sysprepData = { [AUTOUNATTEND]: autounattend, [UNATTEND]: unattended };

  const configMap = generateNewSysprepConfig({
    data: sysprepData,
    sysprepName: externalSysprepConfig?.metadata?.name,
    vm,
  });

  if (externalSysprepConfig) {
    await k8sPatch({
      data: [
        {
          op: 'replace',
          path: `/data`,
          value: configMap.data,
        },
      ],
      model: ConfigMapModel,
      resource: externalSysprepConfig,
    });
    return;
  }

  await k8sCreate({ data: configMap, model: ConfigMapModel });
  await k8sPatch<V1VirtualMachine>({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks`,
        value: [...vmDisks, sysprepDisk()],
      },
      {
        op: 'replace',
        path: `/spec/template/spec/volumes`,
        value: [...vmVolumes, sysprepVolume(configMap.metadata.name)],
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });
};
