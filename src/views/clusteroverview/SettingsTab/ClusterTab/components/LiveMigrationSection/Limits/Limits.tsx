import React, { useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NumberInput, Skeleton, Text, TextVariants, Title } from '@patternfly/react-core';

import { useDebounceCallback } from '../../../../../utils/hooks/useDebounceCallback';
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
            {t('Max. migrations per cluster')}
          </Title>
          {!isNaN(migrationPerCluster) ? (
            <NumberInput
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
              min={0}
              value={migrationPerCluster}
            />
          ) : (
            <Skeleton height={'33px'} width={'140px'} />
          )}
        </div>
        <div>
          <Title headingLevel="h6" size="md">
            {t('Max. migrations per node')}
          </Title>
          {!isNaN(migrationPerNode) ? (
            <NumberInput
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                Number(event.target.value) >= 0 &&
                setMigrationPerNode(() => {
                  updateValuesNode(hyperConverge, Number(event.target.value), MIGRATION_PER_NODE);
                  return Number(event.target.value);
                })
              }
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
              min={0}
              value={migrationPerNode}
            />
          ) : (
            <Skeleton height={'33px'} width={'140px'} />
          )}
        </div>
      </div>
    </>
  );
};

export default Limits;
