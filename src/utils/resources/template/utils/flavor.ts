import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getTemplateFlavor, getTemplateVirtualMachineObject } from './selectors';

/**
 * parses CPU and returns its sockets, cores and threads
 * @param cpu - V1CPU to parse
 */
export const parseCPU = (cpu: V1CPU): V1CPU => {
  return {
    sockets: cpu?.sockets || 1,
    cores: cpu?.cores || 1,
    threads: cpu?.threads || 1,
  };
};

/**
 * parses CPU and returns its count
 * @param cpu - V1CPU to parse
 */
export const vCPUCount = (cpu: V1CPU): number => {
  const parsedCpu = parseCPU(cpu);
  return parsedCpu.sockets * parsedCpu.cores * parsedCpu.threads;
};

/**
 * parses template and returns its flavor data
 * @param {V1Template} template - template to parse
 */
export const getFlavorData = (
  template: V1Template,
): {
  flavor: string;
  cpuCount: number;
  memory: string;
} => {
  const cpu = getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.cpu;
  const memory = (
    getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.resources
      ?.requests as { memory: string }
  )?.memory;

  const cpuCount = vCPUCount(cpu);
  const flavor = getTemplateFlavor(template);

  return { flavor, cpuCount, memory };
};

/**
 * parses vm and returns its cpu and memory data
 * @param {V1VirtualMachine} vm - vm to parse
 */
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

/**
 * parses template and returns its cpu and memory data
 * @param {V1Template} template - template to parse
 */
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
