import { bytesFromHumanReadable } from '@catalog/utils/quantity';
import { MAX_MEMORY } from '@kubevirt-utils/components/CPUMemoryModal/utils/constants';

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

export const requestedMemExceedsMaxMemory = (memorySize: number, memoryUnit: string) => {
  const maxBytes = bytesFromHumanReadable(MAX_MEMORY);
  const requestedBytes = bytesFromHumanReadable(`${memorySize}${memoryUnit}`);

  return requestedBytes > maxBytes;
};
