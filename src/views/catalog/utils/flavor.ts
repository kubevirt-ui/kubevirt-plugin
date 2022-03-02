import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getTemplateFlavor } from '../templatescatalog/utils/helpers';

import { getTemplateVirtualMachineObject } from './templateGetters';

export const parseCPU = (cpu: V1CPU): V1CPU => {
  return {
    sockets: cpu?.sockets || 1,
    cores: cpu?.cores || 1,
    threads: cpu?.threads || 1,
  };
};

export const vCPUCount = (cpu: V1CPU): number => {
  const parsedCpu = parseCPU(cpu);
  return parsedCpu.sockets * parsedCpu.cores * parsedCpu.threads;
};

export const getVmCPUMemory = (
  vm: V1VirtualMachine,
): {
  cpuCount: number;
  memory: string;
} => {
  const cpu = vm?.spec?.template?.spec?.domain?.cpu;
  const memory = (vm?.spec?.template?.spec?.domain?.resources?.requests as { memory: string })
    ?.memory;

  const cpuCount = vCPUCount(cpu);

  return { cpuCount, memory };
};

export const getTemplateFlavorData = (
  template: V1Template,
): {
  flavor: string;
  cpuCount: number;
  memory: string;
} => {
  const flavor = getTemplateFlavor(template);

  return { flavor, ...getVmCPUMemory(getTemplateVirtualMachineObject(template)) };
};
