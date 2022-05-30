import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import '../tables.scss';

const DiskListTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <h3 className="HeaderWithIcon">{t('Disks')}</h3>
      <Popover
        bodyContent={t(
          'The following information is provided by the OpenShift Virtualization operator.',
        )}
        position={PopoverPosition.right}
      >
        <HelpIcon className="icon-size-small" />
      </Popover>
    </span>
  );
};

export default DiskListTitle;
