import React, { FC } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Tooltip } from '@patternfly/react-core';

const InstallSelectedButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();

  const tooltipContent = isAdmin
    ? t('Select capabilities to install')
    : t('You must be an administrator to install operators');

  return (
    <Tooltip content={tooltipContent}>
      <Button isDisabled variant="primary">
        {t('Install selected')}
      </Button>
    </Tooltip>
  );
};

export default InstallSelectedButton;
