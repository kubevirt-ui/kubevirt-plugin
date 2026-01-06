import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VM_VALIDATIONS_ANNOTATION } from '@kubevirt-utils/resources/vm/utils/annotations';

export const DEFAULT_CPU_COMPONENT_VALUE = 1;

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
  // VMs migrated from vSphere may not have spec.template.spec.domain.cpu.threads set
  cpu?.cores * cpu?.sockets * (cpu?.threads || DEFAULT_CPU_COMPONENT_VALUE);

export const formatVCPUsAsSockets = (cpu: V1CPU): V1CPU => {
  return { ...cpu };
};

type VMValidationRule = {
  max?: number;
  message: string;
  min?: number;
  name: string;
  path: string;
  rule: string;
};

const parseJSONAnnotation = <T = any>(
  annotations: Record<string, string>,
  key: string,
  defaultValue: T,
): T => {
  try {
    const value = annotations?.[key];
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const parseValidationAnnotations = (
  annotations?: Record<string, string>,
): Record<string, number> => {
  const validations = parseJSONAnnotation<VMValidationRule[]>(
    annotations,
    VM_VALIDATIONS_ANNOTATION,
    [],
  );

  if (!validations?.length) {
    return {
      cores: DEFAULT_CPU_COMPONENT_VALUE,
      sockets: DEFAULT_CPU_COMPONENT_VALUE,
      threads: DEFAULT_CPU_COMPONENT_VALUE,
    };
  }

  const coresValidation = validations.find((value) =>
    value.path?.includes(`cpu.${CPUComponent.cores}`),
  );
  const socketsValidation = validations.find((value) =>
    value.path?.includes(`cpu.${CPUComponent.sockets}`),
  );
  const threadsValidation = validations.find((value) =>
    value.path?.includes(`cpu.${CPUComponent.threads}`),
  );

  return {
    [CPUComponent.cores]: coresValidation?.min || DEFAULT_CPU_COMPONENT_VALUE,
    [CPUComponent.sockets]: socketsValidation?.min || DEFAULT_CPU_COMPONENT_VALUE,
    [CPUComponent.threads]: threadsValidation?.min || DEFAULT_CPU_COMPONENT_VALUE,
  };
};

export const getCPULimitsFromVM = (vm: V1VirtualMachine): Record<string, number> => {
  return parseValidationAnnotations(vm?.metadata?.annotations);
};

export const getCPULimitsFromTemplate = (template: V1Template): Record<string, number> => {
  return parseValidationAnnotations(template?.metadata?.annotations);
};

export const isSimpleCPUTopology = (cpu: V1CPU): boolean => {
  return (
    (cpu?.cores || DEFAULT_CPU_COMPONENT_VALUE) === DEFAULT_CPU_COMPONENT_VALUE &&
    (cpu?.threads || DEFAULT_CPU_COMPONENT_VALUE) === DEFAULT_CPU_COMPONENT_VALUE
  );
};

export const getInitialCPUInputType = (cpu: V1CPU): CPUInputType => {
  return isSimpleCPUTopology(cpu) ? CPUInputType.editVCPU : CPUInputType.editTopologyManually;
};
