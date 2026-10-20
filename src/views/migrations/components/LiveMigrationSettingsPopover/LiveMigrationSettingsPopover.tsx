import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, Stack, StackItem, Title } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import useHyperConvergedMigrations from './hooks/useHyperConvergedMigrations';

const LiveMigrationSettingsPopover: FC = () => {
  const { t } = useKubevirtTranslation();
  const { error, loaded, migrations } = useHyperConvergedMigrations();

  if (!loaded || error || !migrations) {
    return null;
  }

  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          <Title headingLevel="h3">{t('Live migration settings')}</Title>
          <StackItem>
            <b>{t('Max. running migrations per cluster')}</b>
            <div>{migrations.parallelMigrationsPerCluster}</div>
          </StackItem>
          <StackItem>
            <b>{t('Max. running migrations per node')}</b>
            <div>{migrations.parallelOutboundMigrationsPerNode}</div>
          </StackItem>
        </Stack>
      }
    >
      <Button
        aria-label={t('Live migration settings')}
        className="kv-monitoring-card__live-settings"
        icon={<OutlinedQuestionCircleIcon />}
        iconPosition="end"
        isInline
        variant="link"
      >
        {t('Live migration settings')}
      </Button>
    </Popover>
  );
};

export default LiveMigrationSettingsPopover;
