import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <h3 className="HeaderWithIcon">
        {t('Disks')}{' '}
        <Popover
          bodyContent={
            <div>
              {t('The following information is provided by the OpenShift Virtualization operator.')}
            </div>
          }
          position={PopoverPosition.right}
        >
          <HelpIcon />
        </Popover>{' '}
      </h3>
    </span>
  );
};

export default DiskListTitle;
