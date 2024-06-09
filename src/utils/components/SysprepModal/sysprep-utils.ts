import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1Disk, V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';

import { SYSPREP } from './consts';

export const AUTOUNATTEND = 'autounattend.xml';
export const UNATTEND = 'unattend.xml';
export const WINDOWS = 'windows';

export type SysprepData = { autounattend?: string; unattended?: string };

export const sysprepDisk = (): V1Disk => ({ cdrom: { bus: 'sata' }, name: SYSPREP });

export const sysprepVolume = (sysprepName: string): V1Volume => ({
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
  (getDisks(vm) || []).push(sysprepDisk());
};

export const removeSysprepConfig = (vm: V1VirtualMachine, sysprepVolumeName: string) => {
  vm.spec.template.spec.volumes = getVolumes(vm).filter(
    (volume) => sysprepVolumeName !== volume.name,
  );
  vm.spec.template.spec.domain.devices.disks = getDisks(vm).filter(
    (disk) => sysprepVolumeName !== disk.name,
  );
};

export const generateSysprepConfigMapName = () => generatePrettyName('sysprep-config');

type GenerateNewSysprepConfig = {
  data: IoK8sApiCoreV1ConfigMap['data'];
  sysprepName?: string;
};

export const generateNewSysprepConfig = ({
  data,
  sysprepName,
}: GenerateNewSysprepConfig): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: ConfigMapModel.apiVersion,
  data,
  kind: ConfigMapModel.kind,
  metadata: {
    name: sysprepName || generateSysprepConfigMapName(),
  },
});

export const getSysprepConfigMapName = (volume: V1Volume) => volume?.sysprep?.configMap?.name;
