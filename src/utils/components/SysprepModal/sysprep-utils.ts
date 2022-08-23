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
  sysprep: {
    configMap: { name: sysprepName },
  },
  name: SYSPREP,
});

export const addSysprepConfig = (vm: V1VirtualMachine, newSysprepName: string) => {
  getVolumes(vm).push({
    sysprep: {
      configMap: { name: newSysprepName },
    },
    name: SYSPREP,
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
  vm: V1VirtualMachine;
  data: IoK8sApiCoreV1ConfigMap['data'];
  sysprepName?: string;
  withOwnerReference?: boolean;
};

export const generateNewSysprepConfig = ({
  vm,
  data,
  sysprepName,
  withOwnerReference = false,
}: GenerateNewSysprepConfigInputType): IoK8sApiCoreV1ConfigMap => ({
  kind: ConfigMapModel.kind,
  apiVersion: ConfigMapModel.apiVersion,
  metadata: {
    name: sysprepName || `sysprep-config-${vm?.metadata?.name}-${getRandomChars()}`,
    namespace: vm?.metadata?.namespace,
    ownerReferences: withOwnerReference
      ? [buildOwnerReference(vm, { blockOwnerDeletion: false })]
      : null,
  },
  data,
});
