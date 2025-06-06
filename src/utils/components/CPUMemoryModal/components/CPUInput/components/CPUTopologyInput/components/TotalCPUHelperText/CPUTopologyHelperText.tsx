import React, { FC } from 'react';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './CPUTopologyHelperText.scss';

type CPUTopologyHelperTextProps = {
  cpu: V1CPU;
};

const CPUTopologyHelperText: FC<CPUTopologyHelperTextProps> = ({ cpu }) => {
  const { t } = useKubevirtTranslation();
  const { cores, sockets, threads } = cpu || {};

  // VMs migrated from vSphere may not have spec.template.spec.domain.cpu.threads set
  const totalCPU = cores * sockets * (threads || 1);

  return (
    <div className="cpu-topology-helper-text">
      {t('Total vCPU is {{totalCPU}}', { totalCPU: totalCPU })}
      <Popover
        bodyContent={<>{t('CPUs = sockets x threads x cores.')}</>}
        hasAutoWidth
        position={PopoverPosition.bottom}
      >
        <Button
          className="cpu-topology-helper-text__button"
          hasNoPadding
          icon={<HelpIcon />}
          variant={ButtonVariant.plain}
        />
      </Popover>
    </div>
  );
};

export default CPUTopologyHelperText;
