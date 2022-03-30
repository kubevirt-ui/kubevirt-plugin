import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { getFlavorData } from '@kubevirt-utils/resources/template';

enum BinaryUnit {
  B = 'B',
  Ki = 'Ki',
  Mi = 'Mi',
  Gi = 'Gi',
  Ti = 'Ti',
}

const toIECUnit = (unit: BinaryUnit | string): string => {
  if (!unit || unit.endsWith('B')) {
    return unit;
  }

  return `${unit}B`;
};

const stringValueUnitSplit = (combinedVal: string): [value: string, unit: string] => {
  const index = combinedVal.search(/([a-zA-Z]+)/g);
  let value = '';
  let unit = '';

  if (index === -1) {
    value = combinedVal;
  } else {
    value = combinedVal.slice(0, index);
    unit = combinedVal.slice(index);
  }

  return [value, toIECUnit(unit)];
};

export const useVirtualMachineTemplatesCPUMemory = (template: V1Template): string => {
  const { t } = useKubevirtTranslation();
  const { cpuCount, memory } = getFlavorData(template);
  const [value, readableUnit] = stringValueUnitSplit(memory);

  return `CPU ${cpuCount} | ${t('Memory')} ${value} ${readableUnit}`;
};
