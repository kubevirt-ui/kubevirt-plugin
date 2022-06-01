import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Badge, Split, SplitItem } from '@patternfly/react-core';

type VirtualMachineTemplatesSourceProps = {
  isBootSourceAvailable: boolean;
  source: string;
};
const VirtualMachineTemplatesSource: React.FC<VirtualMachineTemplatesSourceProps> = ({
  isBootSourceAvailable,
  source,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Split hasGutter>
      <SplitItem>{source}</SplitItem>
      {isBootSourceAvailable && (
        <SplitItem>
          <Badge key="available-boot">{t('Source available')}</Badge>
        </SplitItem>
      )}
    </Split>
  );
};

export default VirtualMachineTemplatesSource;
