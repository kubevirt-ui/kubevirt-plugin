import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, Stack, StackItem, Title } from '@patternfly/react-core';

import useHCMigrations from './hooks/useHCMigrations';

const MigrationsLimitionsPopover: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const migrations = useHCMigrations();
  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <Title headingLevel="h3">{t('Live migrations settings')}</Title>
          <StackItem>
            <b>{t('Max. running migrations per cluster')}</b>
            <div>{migrations?.parallelMigrationsPerCluster}</div>
          </StackItem>
          <StackItem>
            <b>{t('Max. running migrations per node')}</b>
            <div>{migrations?.parallelOutboundMigrationsPerNode}</div>
          </StackItem>
        </Stack>
      }
    >
      <a onClick={(e) => e.preventDefault()}>{t('Limitations')}</a>
    </Popover>
  );
};

export default MigrationsLimitionsPopover;
