import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './PermissionsCardTitle.scss';

const PermissionsCardTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <span className="kv-permissions-card__title">{t('Permissions')}</span>
      <Popover
        headerContent={<div>{t('Permissions')}</div>}
        bodyContent={
          <div>
            {t(
              'Permissions inform you of the user capabilities assigned to the user role for each listed task. There will be an orange alert icon next to any task that you are not permitted to perform.',
            )}
          </div>
        }
        position={PopoverPosition.top}
      >
        <HelpIcon />
      </Popover>
    </span>
  );
};

export default PermissionsCardTitle;
