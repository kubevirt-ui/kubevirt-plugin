import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vCPUCount } from '@kubevirt-utils/resources/template/utils';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import {
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type TolerationsProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUMemory: React.FC<TolerationsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const cpu = vCPUCount(vmi?.spec?.domain?.cpu);

  const memory = readableSizeUnit(
    (vmi?.spec?.domain?.resources?.requests as { [key: string]: string })?.memory,
  );

  return (
    <>
      <DescriptionListTermHelpText>
        <Popover
          hasAutoWidth
          maxWidth="30rem"
          headerContent={t('CPU | Memory')}
          bodyContent={<CPUDescription cpu={vmi?.spec?.domain?.cpu} />}
        >
          <DescriptionListTermHelpTextButton>{t('CPU | Memory')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      {t('{{cpu}} CPU | {{memory}} Memory', { cpu, memory })}
    </>
  );
};

export default CPUMemory;
