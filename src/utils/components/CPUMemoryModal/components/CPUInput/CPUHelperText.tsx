import React, { FC } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Popover,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './CPUHelperText.scss';

type CPUHelperTextProps = {
  cpu: V1CPU;
  sockets: number;
};

const CPUHelperText: FC<CPUHelperTextProps> = ({ cpu, sockets }) => {
  const { t } = useKubevirtTranslation();
  const { cores, threads } = cpu;

  const totalCPU = cores * sockets * threads;

  if (totalCPU === 1) return null;

  return (
    <div className="cpu-helper-text">
      {t('Total CPU is {{totalCPU}}', { totalCPU: totalCPU })}
      <Popover
        bodyContent={
          <Stack className="cpu-helper-text__body-content">
            <StackItem>{t('{{sockets}} sockets', { sockets })}</StackItem>
            <StackItem>{t('{{threads}} threads', { threads })}</StackItem>
            <StackItem>{t('{{cores}} cores', { cores })}</StackItem>
          </Stack>
        }
        hasAutoWidth
        position={PopoverPosition.bottom}
      >
        <Button className="cpu-input__help-text-button" variant={ButtonVariant.plain}>
          <HelpIcon />
        </Button>
      </Popover>
    </div>
  );
};

export default CPUHelperText;
