import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CardTitle, PopoverPosition } from '@patternfly/react-core';

const VirtualMachinesOverviewTabFilesystemTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <CardTitle className="text-muted">
      {t('File systems')}{' '}
      <HelpTextIcon
        bodyContent={t(
          'The following information regarding how the disks are partitioned is provided by the guest agent.',
        )}
        position={PopoverPosition.right}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabFilesystemTitle;
