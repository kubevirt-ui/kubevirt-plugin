import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { getFlavorData, getTemplateVirtualMachineCPU } from '@kubevirt-utils/resources/template';
import { isTemplateParameter } from '@kubevirt-utils/utils/utils';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

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

export const useVirtualMachineTemplatesCPUMemory = (
  template: V1Template,
): string | React.ReactNode => {
  const { t } = useKubevirtTranslation();
  const { cpuCount, memory } = getFlavorData(template);

  if (!cpuCount || isTemplateParameter(memory)) {
    const cpu = getTemplateVirtualMachineCPU(template);

    return (
      <>
        {t('CPU | Memory depend on parameters')}{' '}
        <Popover
          bodyContent={
            <ul>
              <li>
                {t('Sockets')}: {cpu.sockets}
              </li>
              <li>
                {t('Cores')}: {cpu.cores}
              </li>
              <li>
                {t('Threads')}: {cpu.threads}
              </li>
              <li>
                {t('Memory')}: {memory}
              </li>
            </ul>
          }
          position={PopoverPosition.right}
        >
          <HelpIcon />
        </Popover>
      </>
    );
  } else {
    const [value, readableUnit] = stringValueUnitSplit(memory);
    return `CPU ${cpuCount} | ${t('Memory')} ${value} ${readableUnit}`;
  }
};
