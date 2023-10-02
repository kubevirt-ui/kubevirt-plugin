import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const SelectCDSourcePopOver: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Popover
      bodyContent={() => (
        <div>
          {t(
            'CD source represents the source for our disk, this can be HTTP, Registry or an existing PVC',
          )}
        </div>
      )}
      aria-label={'Help'}
    >
      <HelpIcon />
    </Popover>
  );
};

export default SelectCDSourcePopOver;
