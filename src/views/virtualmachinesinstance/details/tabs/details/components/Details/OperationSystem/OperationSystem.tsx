import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getOperatingSystem,
  getOperatingSystemName,
} from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';

type OperationSystemProps = {
  vmi: V1VirtualMachineInstance;
};

const OperationSystem: React.FC<OperationSystemProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <DescriptionListTerm>{t('Operation System')}</DescriptionListTerm>
      <DescriptionListDescription>
        {getOperatingSystemName(vmi) || getOperatingSystem(vmi)}
      </DescriptionListDescription>
    </>
  );
};

export default OperationSystem;
