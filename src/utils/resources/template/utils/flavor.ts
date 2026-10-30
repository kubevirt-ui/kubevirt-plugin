import { type TFunction } from 'i18next';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getInstanceTypeCPU,
  getInstanceTypeMemory,
} from '@kubevirt-utils/resources/instancetype/selectors';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { type Template } from '@kubevirt-utils/resources/template';
import {
  type CPUMemoryDisplayOptions,
  type CPUMemoryDisplayValue,
  getCPU,
  getCPUMemoryDisplayValue,
  getMemory,
  getMemoryCPU,
} from '@kubevirt-utils/resources/vm';

import {
  getTemplateFlavor,
  getTemplateVirtualMachineCPU,
  getTemplateVirtualMachineObject,
} from './selectors';
import { findInstanceTypeForTemplate, isTemplateWithInstanceType } from './templateInstanceType';

export type TemplateCPUMemoryDisplayOptions = CPUMemoryDisplayOptions & {
  instanceTypes?: InstanceTypeUnion[];
};

const getTemplateCPUMemoryFromInstanceTypes = (
  template: Template,
  instanceTypes: InstanceTypeUnion[],
): { cpu: V1CPU | undefined; memory: string | undefined } | undefined => {
  const instanceType = findInstanceTypeForTemplate(template, instanceTypes);
  if (!instanceType) {
    return undefined;
  }

  const cpuCount = getInstanceTypeCPU(instanceType);
  const memory = getInstanceTypeMemory(instanceType)?.toString();

  return {
    cpu: cpuCount ? { cores: cpuCount } : undefined,
    memory,
  };
};

type TemplateCPUMemorySources = {
  cpu: V1CPU | undefined;
  memory: string | undefined;
};

/** Domain CPU/memory, or empty when instance-type lookup failed and domain values would mislead. */
const resolveTemplateCPUMemorySources = (
  template: Template,
  instanceTypes?: InstanceTypeUnion[],
): TemplateCPUMemorySources => {
  if (instanceTypes?.length) {
    const fromInstanceType = getTemplateCPUMemoryFromInstanceTypes(template, instanceTypes);
    if (fromInstanceType) {
      return fromInstanceType;
    }
  }

  const shouldUseDomain = !isTemplateWithInstanceType(template) || !instanceTypes?.length;

  if (shouldUseDomain) {
    return getMemoryCPU(getTemplateVirtualMachineObject(template));
  }

  return { cpu: undefined, memory: undefined };
};

/**
 * parses CPU and returns its sockets, cores and threads
 * @param cpu - V1CPU to parse
 */
export const parseCPU = (cpu: V1CPU): V1CPU => {
  return {
    cores: cpu?.cores ?? 1,
    sockets: cpu?.sockets ?? 1,
    threads: cpu?.threads ?? 1,
  };
};

/**
 * parses CPU and returns its count
 * @param cpu - V1CPU to parse
 */
export const vCPUCount = (cpu: V1CPU): number => {
  const parsedCpu = parseCPU(cpu);

  // VMs migrated from vSphere may not have spec.template.spec.domain.cpu.threads set
  return parsedCpu.sockets * parsedCpu.cores * (parsedCpu.threads ?? 1);
};

/**
 * parses template and returns its flavor data
 * @param {V1Template} template - template to parse
 */
export const getFlavorData = (
  template: V1Template,
): {
  cpuCount: number;
  flavor: string;
  memory: string;
} => {
  const cpu = getTemplateVirtualMachineCPU(template);
  const memory = getMemory(getTemplateVirtualMachineObject(template));

  const cpuCount = vCPUCount(cpu);
  const flavor = getTemplateFlavor(template);

  return {
    cpuCount,
    flavor,
    memory,
  };
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
  const cpu = getCPU(vm);
  const memory = getMemory(vm);

  const cpuCount = vCPUCount(cpu);

  return {
    cpuCount,
    memory,
  };
};

/**
 * parses template and returns its cpu and memory data
 * @param {V1Template} template - template to parse
 */
export const getTemplateFlavorData = (
  template: Template,
): {
  cpuCount: number;
  flavor: string;
  memory: string;
} => {
  const flavor = getTemplateFlavor(template);

  return { flavor, ...getVmCPUMemory(getTemplateVirtualMachineObject(template)) };
};

/**
 * parses template and returns its cpu/memory display-ready values (see
 * getCPUMemoryDisplayValue in @kubevirt-utils/resources/vm)
 * @param {Template} template - template to parse
 */
export const getTemplateCPUMemoryDisplayValue = (
  template: Template,
  t: TFunction,
  options?: TemplateCPUMemoryDisplayOptions,
): CPUMemoryDisplayValue => {
  const { cpu, memory } = resolveTemplateCPUMemorySources(template, options?.instanceTypes);

  return getCPUMemoryDisplayValue(cpu, memory, t, options);
};
