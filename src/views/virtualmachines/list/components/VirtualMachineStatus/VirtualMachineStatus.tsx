import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge, HelperText, HelperTextItem, Split, SplitItem } from '@patternfly/react-core';

import { getVMStatusIcon } from '../../../utils';

const VirtualMachineStatus: React.FC<VirtualMachinesPageStatusProps> = ({
  printableStatus,
  isMigratable,
}) => {
  const { t } = useKubevirtTranslation();
  const Icon = getVMStatusIcon(printableStatus);

  return (
    <Split hasGutter>
      <SplitItem>
        <HelperText>
          <HelperTextItem icon={<Icon />}>{printableStatus}</HelperTextItem>
        </HelperText>
      </SplitItem>
      {!isMigratable && (
        <SplitItem>
          <Badge key="available-boot">{t('Not migratable')}</Badge>
        </SplitItem>
      )}
    </Split>
  );
};

type VirtualMachinesPageStatusProps = {
  printableStatus: string;
  isMigratable: boolean;
};

export default VirtualMachineStatus;
