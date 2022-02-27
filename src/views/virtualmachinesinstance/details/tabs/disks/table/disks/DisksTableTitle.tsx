import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const DiskTableTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageHeader title={t('Disks')}>
      <Popover
        bodyContent={
          <div>
            {t('The following information is provided by the OpenShift Virtualization operator.')}
          </div>
        }
        position={PopoverPosition.right}
      >
        <HelpIcon className="DisksTableTitle-icon" />
      </Popover>
    </ListPageHeader>
  );
};

export default DiskTableTitle;
