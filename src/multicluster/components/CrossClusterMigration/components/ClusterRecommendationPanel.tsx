import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Flex, FlexItem, Spinner, Stack, StackItem, Title } from '@patternfly/react-core';

import { MigrationTargetResponse } from '../hooks/useClusterRecommendationTypes';

import CandidateRow from './CandidateRow';

type ClusterRecommendationPanelProps = {
  data: MigrationTargetResponse | null;
  error: Error | null;
  loaded: boolean;
  loading: boolean;
  onSelectCluster?: (clusterName: string) => void;
};

const ClusterRecommendationPanel: FC<ClusterRecommendationPanelProps> = ({
  data,
  error,
  loaded,
  loading,
  onSelectCluster,
}) => {
  const { t } = useKubevirtTranslation();
  const [selectedCluster, setSelectedCluster] = useState<null | string>(null);

  if (loading) {
    return (
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        className="pf-v6-u-mt-md"
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <FlexItem>
          <Spinner size="md" />
        </FlexItem>
        <FlexItem>{t('Analyzing clusters...')}</FlexItem>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert isInline title={t('Failed to get cluster recommendations')} variant="danger">
        {error.message}
      </Alert>
    );
  }

  if (!loaded || !data) return null;

  if (!data.candidates?.length) {
    return (
      <Alert isInline title={t('No suitable clusters found')} variant="warning">
        {t('No clusters meet the resource requirements for this VirtualMachine.')}
      </Alert>
    );
  }

  const recommendedCluster = data.recommendation?.cluster;

  const handleSelect = (clusterName: string) => {
    setSelectedCluster(clusterName);
    onSelectCluster?.(clusterName);
  };

  return (
    <Stack className="pf-v6-u-mt-md" hasGutter>
      <StackItem>
        <Title headingLevel="h6">{t('Cluster recommendation')}</Title>
        <div className="pf-v6-u-color-200 pf-v6-u-mt-xs pf-v6-u-font-size-sm">
          {t('Click the cluster to select it as the migration target.')}
        </div>
      </StackItem>
      <StackItem>
        <Stack hasGutter>
          {data.candidates.map((candidate) => (
            <StackItem key={candidate.cluster}>
              <CandidateRow
                candidate={candidate}
                isRecommended={candidate.cluster === recommendedCluster}
                isSelected={selectedCluster === candidate.cluster}
                onSelect={handleSelect}
              />
            </StackItem>
          ))}
        </Stack>
      </StackItem>
      {data.excludedClusters?.length > 0 && (
        <StackItem>
          <Alert
            title={t('{{clusterCount}} clusters excluded', {
              clusterCount: data.excludedClusters.length,
            })}
            isInline
            isPlain
            variant="info"
          >
            {data.excludedClusters.map((ec) => (
              <div key={ec.cluster}>
                <strong>{ec.cluster}</strong>: {ec.reasons?.join(', ')}
              </div>
            ))}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ClusterRecommendationPanel;
