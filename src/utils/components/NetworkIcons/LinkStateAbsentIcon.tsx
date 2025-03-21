import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import './LinkStateIcon.scss';

const LinkStateAbsentIcon: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={t('This interface is currently hot-unplugged until the VirtualMachine is migrated.')}
      position={TooltipPosition.right}
    >
      <InProgressIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateAbsentIcon;
