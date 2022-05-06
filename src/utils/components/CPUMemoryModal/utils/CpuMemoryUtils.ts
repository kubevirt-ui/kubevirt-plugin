import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getCPUcores = (vm: V1VirtualMachine): number =>
  vm?.spec?.template?.spec?.domain?.cpu?.cores || 1;

const GI = 'Gi';
const MI = 'Mi';
const TI = 'Ti';

const unitsConvertor = new Proxy(
  {
    Gi: GI,
    Mi: MI,
    Ti: TI,
  },
  {
    // eslint-disable-next-line require-jsdoc
    get(target, prop) {
      return target[prop] || target.Gi;
    },
  },
);

export const getMemorySize = (
  sourceMemory: { [key: string]: string } | string,
): { size: number; unit: string } => {
  if (typeof sourceMemory === 'string') {
    const [size, unit] = sourceMemory?.split?.(/(\d+)/g).filter(Boolean);
    return { size: +size || 0, unit: unitsConvertor[unit] };
  }
  return { size: +sourceMemory?.size || 0, unit: unitsConvertor[sourceMemory?.unit] };
};

export const memorySizesTypes = [GI, MI, TI];
