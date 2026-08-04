const GIBIBYTE = 'Gi';
const MEBIBYTE = 'Mi';
const TEBIBYTE = 'Ti';

const unitsConvertor = new Proxy<Record<string, string>>(
  {
    Gi: GIBIBYTE,
    Mi: MEBIBYTE,
    Ti: TEBIBYTE,
  },
  {
    get(target: Record<string, string>, prop: string): string {
      return target[prop] ?? '';
    },
  },
);

export const getMemorySize = (
  sourceMemory: { [key: string]: string } | string,
): { size: number; unit: string } => {
  if (typeof sourceMemory === 'string') {
    const parts = sourceMemory?.split?.(/(\d+)/g).filter(Boolean) ?? [];
    const size = parts[0] ?? '';
    const unit = parts[1] ?? '';
    return { size: +size || 0, unit: unitsConvertor[unit] };
  }
  return { size: +sourceMemory?.size || 0, unit: unitsConvertor[sourceMemory?.unit ?? ''] };
};

export const memorySizesTypes = [GIBIBYTE, MEBIBYTE, TEBIBYTE];
