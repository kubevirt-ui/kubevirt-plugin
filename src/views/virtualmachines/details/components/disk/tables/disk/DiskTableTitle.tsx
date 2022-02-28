import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const DiskTableTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <h3>
      {t('Disks')}{' '}
      <Popover
        bodyContent={
          <div>
            {t('The following information is provided by the OpenShift Virtualization operator.')}
          </div>
        }
        position={PopoverPosition.right}
      >
        <HelpIcon size="sm" className="DisksTableTitle-icon" />
      </Popover>
    </h3>
  );
};

export default DiskTableTitle;
