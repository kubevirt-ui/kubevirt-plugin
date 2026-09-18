import { ConfigMapModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import { type PatchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sPatch } from '@multicluster/k8sRequests';

export const patchVMWithExistingSysprepConfigMap = async (
  name: string,
  vm: V1VirtualMachine,
  onSubmit?: PatchCustomizeWizardVMSignal,
): Promise<void> => {
  const vmVolumes = getVolumes(vm);
  const vmDisks = getDisks(vm);

  onSubmit
    ? onSubmit([
        {
          data: [
            ...(vmDisks ?? []).filter((disk) => disk?.name !== SYSPREP),
            ...(!isEmpty(name) ? [sysprepDisk()] : []),
          ],
          path: `spec.template.spec.domain.devices.disks`,
        },
        {
          data: [
            ...(vmVolumes ?? []).filter((vol) => vol?.name !== SYSPREP),
            ...(!isEmpty(name) ? [sysprepVolume(name)] : []),
          ],
          path: `spec.template.spec.volumes`,
        },
      ])
    : await kubevirtK8sPatch<V1VirtualMachine>({
        cluster: getCluster(vm),
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
  vm: V1VirtualMachine,
  onSubmit?: PatchCustomizeWizardVMSignal,
): Promise<void> => {
  const vmVolumes = getVolumes(vm);
  const vmDisks = getDisks(vm);

  const sysprepData = { [AUTOUNATTEND]: autounattend, [UNATTEND]: unattended };

  const configMap = generateNewSysprepConfig({
    data: sysprepData,
  });

  await kubevirtK8sCreate({
    cluster: getCluster(vm),
    data: configMap,
    model: ConfigMapModel,
    ns: getNamespace(vm),
  });

  const updatedDisks = [...(vmDisks ?? []).filter((disk) => disk?.name !== SYSPREP), sysprepDisk()];
  const updatedVolumes = [
    ...(vmVolumes ?? []).filter((vol) => vol?.name !== SYSPREP),
    sysprepVolume(configMap.metadata.name),
  ];

  onSubmit
    ? onSubmit([
        {
          data: updatedDisks,
          path: 'spec.template.spec.domain.devices.disks',
        },
        {
          data: updatedVolumes,
          path: `spec.template.spec.volumes`,
        },
      ])
    : await kubevirtK8sPatch<V1VirtualMachine>({
        cluster: getCluster(vm),
        data: [
          {
            op: 'replace',
            path: `/spec/template/spec/domain/devices/disks`,
            value: updatedDisks,
          },
          {
            op: 'replace',
            path: `/spec/template/spec/volumes`,
            value: updatedVolumes,
          },
        ],
        model: VirtualMachineModel,
        resource: vm,
      });
};
