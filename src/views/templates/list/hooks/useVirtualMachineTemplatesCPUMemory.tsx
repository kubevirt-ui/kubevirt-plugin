import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import {
  getFlavorData,
  getTemplateVirtualMachineCPU,
  vCPUCount,
} from '@kubevirt-utils/resources/template';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isTemplateParameter } from '@kubevirt-utils/utils/utils';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export const useVirtualMachineTemplatesCPUMemory = (
  template: V1Template,
): React.ReactNode | string => {
  const { t } = useKubevirtTranslation();
  const cpu = getTemplateVirtualMachineCPU(template);
  const { memory } = getFlavorData(template);

  if (isTemplateParameter(memory)) {
    return (
      <>
        {t('CPU | Memory depend on parameters')}{' '}
        <Popover
          bodyContent={
            <ul>
              <li>
                {t('Sockets')}: {cpu?.sockets}
              </li>
              <li>
                {t('Cores')}: {cpu?.cores}
              </li>
              <li>
                {t('Threads')}: {cpu?.threads}
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
    return `CPU ${vCPUCount(cpu)} | ${t('Memory')} ${readableSizeUnit(memory)}`;
  }
};
