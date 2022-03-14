import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getCPUCount = (sourceCPU: V1CPU): number => {
  return (sourceCPU?.sockets || 1) * (sourceCPU?.cores || 1) * (sourceCPU?.threads || 1);
};

const GIB = 'GiB';
const MIB = 'MiB';
const TIB = 'TiB';

const unitsConvertor = new Proxy(
  {
    Gi: GIB,
    Mi: MIB,
    Ti: TIB,
  },
  {
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

export const memorySizesTypes = [GIB, MIB, TIB];
