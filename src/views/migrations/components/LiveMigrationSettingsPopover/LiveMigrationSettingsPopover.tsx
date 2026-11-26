import { type FC, type ReactNode, useMemo } from 'react';
import { Link } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import BlueOutlinedQuestionCircleIcon from '@kubevirt-utils/icons/BlueOutlinedQuestionCircleIcon';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Flex, FlexItem, Popover, Stack, StackItem, Title } from '@patternfly/react-core';
import { getLiveMigrationSettingsURL } from '@settings/search/search';

import useHyperConvergedMigrations from './hooks/useHyperConvergedMigrations';

const LiveMigrationSettingsPopover: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const { error, loaded, migrations } = useHyperConvergedMigrations();

  const settingsURL = useMemo(
    () => getLiveMigrationSettingsURL(activeNamespace),
    [activeNamespace],
  );

  const limitsPopoverBody = useMemo((): ReactNode => {
    if (!loaded) {
      return t('Loading');
    }
    if (error || !migrations) {
      return t('Live migration limits are not available.');
    }
    return (
      <Stack hasGutter>
        <StackItem>
          <b>{t('Max. running migrations per cluster')}</b>
          <div>{migrations.parallelMigrationsPerCluster}</div>
        </StackItem>
        <StackItem>
          <b>{t('Max. running migrations per node')}</b>
          <div>{migrations.parallelOutboundMigrationsPerNode}</div>
        </StackItem>
      </Stack>
    );
  }, [error, loaded, migrations, t]);

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'nowrap' }}
      gap={{ default: 'gapSm' }}
    >
      <FlexItem>
        <Link
          className="kv-monitoring-card__live-settings"
          data-test="migrations-live-migration-settings-link"
          to={settingsURL}
        >
          {t('Live migration settings')}
        </Link>
      </FlexItem>
      <FlexItem>
        <Popover
          aria-label={t('Live migration limits')}
          bodyContent={limitsPopoverBody}
          headerContent={<Title headingLevel="h3">{t('Live migration settings')}</Title>}
        >
          <Button
            aria-label={t('Live migration limits')}
            data-test="migrations-live-migration-settings-help"
            variant="plain"
          >
            <BlueOutlinedQuestionCircleIcon />
          </Button>
        </Popover>
      </FlexItem>
    </Flex>
  );
};

export default LiveMigrationSettingsPopover;
