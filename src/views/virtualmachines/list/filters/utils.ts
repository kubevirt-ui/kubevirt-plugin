import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import { numberOperatorInfo } from '@kubevirt-utils/utils/constants';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { type VMIMapper } from '@virtualmachines/utils/mappers';

export const getOperatorChipLabel = (value: string): string => {
  const [operator, ...rest] = value.split(' ');
  return `${numberOperatorInfo[operator]?.sign ?? operator} ${rest.join(' ')}`;
};

export const getNodes = (vmiMapper: VMIMapper): string[] => {
  return Object.values(vmiMapper?.nodeNames)
    .sort((a, b) => universalComparator(a?.id, b?.id))
    .map((node) => node.id);
};

export const getArchitectures = (vms: V1VirtualMachine[]): string[] =>
  Array.from(
    vms?.reduce((acc, vm) => {
      const arch = getArchitecture(vm);
      if (arch) acc.add(arch);
      return acc;
    }, new Set<string>()) ?? [],
  ).sort(universalComparator);
