import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <h3 className="HeaderWithIcon">
        {t('Disks')}{' '}
        <Popover
          bodyContent={t(
            'The following information is provided by the OpenShift Virtualization operator.',
          )}
          position={PopoverPosition.right}
        >
          <HelpIcon className="icon-size-small" />
        </Popover>{' '}
      </h3>
    </div>
  );
};

export default DiskListTitle;
