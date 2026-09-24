import produce from 'immer';

import { ConfigMapModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1Disk,
  type V1VirtualMachine,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SYSPREP } from '@kubevirt-utils/components/SysprepModal/consts';
import {
  AUTOUNATTEND,
  generateNewSysprepConfig,
  sysprepDisk,
  sysprepVolume,
  UNATTEND,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

export type SubmitSysprepVM = (
  updatedVM: V1VirtualMachine,
) => Promise<V1VirtualMachine | void> | V1VirtualMachine | void;

const submitSysprepStorage = async (
  vm: V1VirtualMachine,
  disks: V1Disk[],
  volumes: V1Volume[],
  onSubmit?: SubmitSysprepVM,
): Promise<void> => {
  if (onSubmit) {
    await onSubmit(
      produce(vm, (draft) => {
        ensurePath(draft, 'spec.template.spec.domain.devices');
        draft.spec.template.spec.domain.devices.disks = disks;
        draft.spec.template.spec.volumes = volumes;
      }),
    );
    return;
  }

  await kubevirtK8sPatch<V1VirtualMachine>({
    cluster: getCluster(vm),
    data: [
      { op: 'replace', path: `/spec/template/spec/domain/devices/disks`, value: disks },
      { op: 'replace', path: `/spec/template/spec/volumes`, value: volumes },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });
};

export const patchVMWithExistingSysprepConfigMap = async (
  name: string,
  vm: V1VirtualMachine,
  onSubmit?: SubmitSysprepVM,
  getCurrentVM?: () => null | undefined | V1VirtualMachine,
): Promise<void> => {
  const currentVM = getCurrentVM?.() ?? vm;
  const vmVolumes = getVolumes(currentVM);
  const vmDisks = getDisks(currentVM);
  const disks = [
    ...(vmDisks ?? []).filter((disk) => disk?.name !== SYSPREP),
    ...(!isEmpty(name) ? [sysprepDisk()] : []),
  ];
  const volumes = [
    ...(vmVolumes ?? []).filter((volume) => volume?.name !== SYSPREP),
    ...(!isEmpty(name) ? [sysprepVolume(name)] : []),
  ];

  await submitSysprepStorage(currentVM, disks, volumes, onSubmit);
};

export const createSysprepConfigMap = async (
  unattended: string,
  autounattend: string,
  vm: V1VirtualMachine,
  onSubmit?: SubmitSysprepVM,
  getCurrentVM?: () => null | undefined | V1VirtualMachine,
): Promise<void> => {
  const sysprepData = { [AUTOUNATTEND]: autounattend, [UNATTEND]: unattended };

  const configMap = generateNewSysprepConfig({
    data: sysprepData,
  });

  const cluster = getCluster(vm);
  const createdConfigMap = await kubevirtK8sCreate({
    cluster,
    data: configMap,
    model: ConfigMapModel,
    ns: getNamespace(vm),
  });
  const currentVM = getCurrentVM?.() ?? vm;
  await patchVMWithExistingSysprepConfigMap(createdConfigMap.metadata.name, currentVM, onSubmit);
};
