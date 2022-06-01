import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const FilesystemListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <h3 className="HeaderWithIcon">{t('File System')}</h3>
      <Popover
        bodyContent={t(
          'The following information regarding how the disks are partitioned is provided by the guest agent.',
        )}
        position={PopoverPosition.right}
      >
        <HelpIcon className="icon-size-small" />
      </Popover>
    </span>
  );
};

export default FilesystemListTitle;
