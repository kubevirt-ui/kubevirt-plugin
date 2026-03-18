import React, { FC } from 'react';

import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition } from '@patternfly/react-core';

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
      <HelpTextIcon
        bodyContent={t('CPUs = sockets x threads x cores.')}
        hasAutoWidth
        helpIconClassName="pf-v6-u-ml-sm"
        position={PopoverPosition.right}
      />
    </div>
  );
};

export default CPUTopologyHelperText;
