import React, { useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useDebounceCallback } from '@overview/utils/hooks/useDebounceCallback';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

import {
  getLiveMigrationConfig,
  MIGRATION_PER_CLUSTER,
  MIGRATION_PER_NODE,
  updateLiveMigrationConfig,
} from '../utils/utils';

import MigrationNumberInput from './MigrationNumberInput';

const Limits = ({ hyperConverge }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();

  const [migrationPerNode, setMigrationPerNode] = useState<number>();
  const [migrationPerCluster, setMigrationPerCluster] = useState<number>();

  const updateConfigWithDebounceCluster: typeof updateLiveMigrationConfig =
    useDebounceCallback(updateLiveMigrationConfig);
  const updateConfigWithDebounceNode: typeof updateLiveMigrationConfig =
    useDebounceCallback(updateLiveMigrationConfig);

  const updateValueCluster = (value: number) =>
    updateConfigWithDebounceCluster(hyperConverge, value, MIGRATION_PER_CLUSTER, cluster);
  const updateValueNode = (value: number) =>
    updateConfigWithDebounceNode(hyperConverge, value, MIGRATION_PER_NODE, cluster);

  useEffect(() => {
    if (!hyperConverge) {
      setMigrationPerCluster(undefined);
      setMigrationPerNode(undefined);
      return;
    }

    const liveMigrationConfig = getLiveMigrationConfig(hyperConverge);
    setMigrationPerCluster(Number(liveMigrationConfig?.parallelMigrationsPerCluster) || 0);
    setMigrationPerNode(Number(liveMigrationConfig?.parallelOutboundMigrationsPerNode) || 0);
  }, [cluster, hyperConverge]);

  return (
    <>
      <Content component={ContentVariants.small}>{t('Set live migration limits')}</Content>
      <div className="live-migration-tab__number--container">
        <div className="live-migration-tab__number--cluster">
          <MigrationNumberInput
            labelHelp={t(
              'Maximum number of migrations running in parallel in the cluster. The format is a number',
            )}
            inputName={MIGRATION_PER_CLUSTER}
            minValue={0}
            promptType={OLSPromptType.MAX_MIGRATIONS_PER_CLUSTER}
            setValue={setMigrationPerCluster}
            title={t('Max. migrations per cluster')}
            updateValue={updateValueCluster}
            value={migrationPerCluster}
          />
        </div>
        <div>
          <MigrationNumberInput
            inputName={MIGRATION_PER_NODE}
            labelHelp={t('Maximum number of outbound migrations per node. The format is a number.')}
            minValue={0}
            promptType={OLSPromptType.MAX_MIGRATIONS_PER_NODE}
            setValue={setMigrationPerNode}
            title={t('Max. migrations per node')}
            updateValue={updateValueNode}
            value={migrationPerNode}
          />
        </div>
      </div>
    </>
  );
};

export default Limits;
