import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { hasRiskyMemoryLimits } from '@kubevirt-utils/resources/vm';
import { Alert, AlertVariant } from '@patternfly/react-core';

type MemoryLimitsWarningProps = {
  isInline?: boolean;
  vm: V1VirtualMachine;
};

const MemoryLimitsWarning: FC<MemoryLimitsWarningProps> = ({ isInline = true, vm }) => {
  const { t } = useKubevirtTranslation();

  if (!hasRiskyMemoryLimits(vm)) return null;

  return (
    <Alert
      title={t(
        'Memory limits are equal to memory requests. This can cause the virt-launcher pod to be OOM-killed during live migration. Consider increasing memory limits or enabling auto-compute resource limits.',
      )}
      isInline={isInline}
      variant={AlertVariant.warning}
    />
  );
};

export default MemoryLimitsWarning;
