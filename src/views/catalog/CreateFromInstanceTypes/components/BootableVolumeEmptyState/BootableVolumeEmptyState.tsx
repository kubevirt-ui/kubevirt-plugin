import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, Title } from '@patternfly/react-core';

const BootableVolumeEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState>
      <Trans ns="plugin__kubevirt-plugin" t={t}>
        <Title headingLevel="h3">No volumes found</Title>
        Click the <b> Add volume</b> button to add a volume to boot from
      </Trans>
    </EmptyState>
  );
};

export default BootableVolumeEmptyState;
