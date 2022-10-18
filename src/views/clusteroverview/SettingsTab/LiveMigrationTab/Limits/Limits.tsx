import React, { useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberInput, Skeleton, Text, TextVariants, Title } from '@patternfly/react-core';

import { useDebounceCallback } from '../../../utils/hooks/useDebounceCallback';
import {
  getLiveMigrationConfig,
  MIGRATION_PER_CLUSTER,
  MIGRATION_PER_NODE,
  updateLiveMigrationConfig,
} from '../utils/utils';

const Limits = ({ hyperConverge }) => {
  const { t } = useKubevirtTranslation();

  const [migrationPerNode, setMigrationPerNode] = useState<number>();
  const [migrationPerCluster, setMigrationPerCluster] = useState<number>();
  const updateValuesCluster = useDebounceCallback(updateLiveMigrationConfig, 500);
  const updateValuesNode = useDebounceCallback(updateLiveMigrationConfig, 500);

  useEffect(() => {
    if (hyperConverge) {
      const liveMigrationConfig = getLiveMigrationConfig(hyperConverge);
      migrationPerCluster ??
        setMigrationPerCluster(Number(liveMigrationConfig?.parallelMigrationsPerCluster) || 0);
      migrationPerCluster ??
        setMigrationPerNode(Number(liveMigrationConfig?.parallelOutboundMigrationsPerNode) || 0);
    }
  }, [hyperConverge, migrationPerCluster, migrationPerNode]);

  return (
    <>
      <Text component={TextVariants.small}>{t('Set live migration limits')}</Text>
      <div className="live-migration-tab__number--container">
        <div className="live-migration-tab__number--cluster">
          <Title headingLevel="h6" size="md">
            {t('Max. Migrations per cluster')}
          </Title>
          {!isNaN(migrationPerCluster) ? (
            <NumberInput
              value={migrationPerCluster}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                Number(event.target.value) >= 0 &&
                  setMigrationPerCluster(() => {
                    updateValuesCluster(
                      hyperConverge,
                      Number(event.target.value),
                      MIGRATION_PER_CLUSTER,
                    );
                    return Number(event.target.value);
                  });
              }}
              min={0}
              onMinus={() =>
                setMigrationPerCluster((newMigrationPerCluster) => {
                  updateValuesCluster(
                    hyperConverge,
                    newMigrationPerCluster - 1,
                    MIGRATION_PER_CLUSTER,
                  );
                  return newMigrationPerCluster - 1;
                })
              }
              onPlus={() =>
                setMigrationPerCluster((newMigrationPerCluster) => {
                  updateValuesCluster(
                    hyperConverge,
                    newMigrationPerCluster + 1,
                    MIGRATION_PER_CLUSTER,
                  );
                  return newMigrationPerCluster + 1;
                })
              }
              inputName={MIGRATION_PER_CLUSTER}
            />
          ) : (
            <Skeleton width={'140px'} height={'33px'} />
          )}
        </div>
        <div>
          <Title headingLevel="h6" size="md">
            {t('Max. Migrations per node')}
          </Title>
          {!isNaN(migrationPerNode) ? (
            <NumberInput
              value={migrationPerNode}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                Number(event.target.value) >= 0 &&
                setMigrationPerNode(() => {
                  updateValuesNode(hyperConverge, Number(event.target.value), MIGRATION_PER_NODE);
                  return Number(event.target.value);
                })
              }
              min={0}
              onMinus={() =>
                setMigrationPerNode((newMigrationPerNode) => {
                  updateValuesNode(hyperConverge, newMigrationPerNode - 1, MIGRATION_PER_NODE);
                  return newMigrationPerNode - 1;
                })
              }
              onPlus={() =>
                setMigrationPerNode((newMigrationPerNode) => {
                  updateValuesNode(hyperConverge, newMigrationPerNode + 1, MIGRATION_PER_NODE);
                  return newMigrationPerNode + 1;
                })
              }
              inputName={MIGRATION_PER_NODE}
            />
          ) : (
            <Skeleton width={'140px'} height={'33px'} />
          )}
        </div>
      </div>
    </>
  );
};

export default Limits;
