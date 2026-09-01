import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { type Template } from '@kubevirt-utils/resources/template';
import { parseJSONAnnotation } from '@kubevirt-utils/utils/utils';

export enum CPUInputType {
  editTopologyManually = 'editTopologyManually',
  editVCPU = 'editVCPU',
}

export enum CPUComponent {
  cores = 'cores',
  sockets = 'sockets',
  threads = 'threads',
}

export const getUpdatedCPU = (cpu: V1CPU, newValue: number, fieldChanged: CPUComponent): V1CPU => {
  return { ...cpu, [fieldChanged]: newValue > 0 ? newValue : cpu?.[fieldChanged] };
};

export const convertTopologyToVCPUs = (cpu: V1CPU): number =>
  (cpu.cores ?? 1) * (cpu.sockets ?? 1) * (cpu.threads ?? 1);

type VMValidationRule = {
  max?: number;
  message: string;
  min?: number;
  name: string;
  path: string;
  rule: string;
};

const parseValidationAnnotations = (
  annotations?: Record<string, string>,
): Record<string, number> => {
  const validations = parseJSONAnnotation<VMValidationRule[]>(
    annotations,
    'vm.kubevirt.io/validations',
    {},
  );

  if (!validations?.length) {
    return { cores: 1, sockets: 1, threads: 1 };
  }

  const coresValidation = validations.find((value) => value.path?.includes('cpu.cores'));
  const socketsValidation = validations.find((value) => value.path?.includes('cpu.sockets'));
  const threadsValidation = validations.find((value) => value.path?.includes('cpu.threads'));

  return {
    cores: coresValidation?.min || 1,
    sockets: socketsValidation?.min || 1,
    threads: threadsValidation?.min || 1,
  };
};

export const getCPULimitsFromVM = (vm: V1VirtualMachine): Record<string, number> => {
  return parseValidationAnnotations(vm?.metadata?.annotations);
};

export const getCPULimitsFromTemplate = (template: Template): Record<string, number> => {
  return parseValidationAnnotations(getAnnotations(template));
};

export const getInitialCPUInputType = (cpu: undefined | V1CPU): CPUInputType => {
  if (!cpu) {
    return CPUInputType.editVCPU;
  }

  const isSimpleCPU = cpu.cores === 1 && cpu.threads === 1;
  return isSimpleCPU ? CPUInputType.editVCPU : CPUInputType.editTopologyManually;
};
