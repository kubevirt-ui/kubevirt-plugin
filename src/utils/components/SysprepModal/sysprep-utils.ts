import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { getRandomChars } from '@kubevirt-utils/utils/utils';

export const SYSPREP = 'sysprep';
export const AUTOUNATTEND = 'Autounattend.xml';
export const UNATTEND = 'Unattend.xml';

export type SysprepData = { autounattend?: string; unattended?: string };

export const sysprepDisk = () => ({ cdrom: { bus: 'sata' }, name: SYSPREP });

export const sysprepVolume = (sysprepName: string) => ({
  name: SYSPREP,
  sysprep: {
    configMap: { name: sysprepName },
  },
});

export const addSysprepConfig = (vm: V1VirtualMachine, newSysprepName: string) => {
  getVolumes(vm).push({
    name: SYSPREP,
    sysprep: {
      configMap: { name: newSysprepName },
    },
  });
  getDisks(vm).push(sysprepDisk());
};

export const removeSysprepConfig = (vm: V1VirtualMachine, sysprepVolumeName: string) => {
  vm.spec.template.spec.volumes = getVolumes(vm).filter(
    (volume) => sysprepVolumeName !== volume.name,
  );
  vm.spec.template.spec.domain.devices.disks = getDisks(vm).filter(
    (disk) => sysprepVolumeName !== disk.name,
  );
};

type GenerateNewSysprepConfigInputType = {
  data: IoK8sApiCoreV1ConfigMap['data'];
  sysprepName?: string;
  vm: V1VirtualMachine;
  withOwnerReference?: boolean;
};

export const generateNewSysprepConfig = ({
  data,
  sysprepName,
  vm,
  withOwnerReference = false,
}: GenerateNewSysprepConfigInputType): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: ConfigMapModel.apiVersion,
  data,
  kind: ConfigMapModel.kind,
  metadata: {
    name: sysprepName || `sysprep-config-${vm?.metadata?.name}-${getRandomChars()}`,
    namespace: vm?.metadata?.namespace,
    ownerReferences: withOwnerReference
      ? [buildOwnerReference(vm, { blockOwnerDeletion: false })]
      : null,
  },
});
