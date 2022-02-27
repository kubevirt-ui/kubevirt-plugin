import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const FileSystemTableTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageHeader title={t('File Systems')}>
      <Popover
        bodyContent={
          <div>
            {t(
              'The following information regarding how the disks are partitioned is provided by the guest agent.',
            )}
          </div>
        }
        position={PopoverPosition.right}
      >
        <HelpIcon className="FileSystemTableTitle-icon" />
      </Popover>
    </ListPageHeader>
  );
};

export default FileSystemTableTitle;
