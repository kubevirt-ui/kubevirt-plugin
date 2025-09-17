import { V1CPU, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { parseJSONAnnotation } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/utils';

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
  cpu?.cores * cpu?.sockets * (cpu?.threads || 1);

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

export const getCPULimitsFromTemplate = (template: V1Template): Record<string, number> => {
  return parseValidationAnnotations(template?.metadata?.annotations);
};

export const getInitialCPUInputType = (cpu: V1CPU): CPUInputType => {
  const isSimpleCPU = (cpu?.cores || 1) === 1 && (cpu?.threads || 1) === 1;
  return isSimpleCPU ? CPUInputType.editVCPU : CPUInputType.editTopologyManually;
};
