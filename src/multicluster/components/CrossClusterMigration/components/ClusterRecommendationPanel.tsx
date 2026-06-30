import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';

import { CandidateCluster, MigrationTargetResponse } from '../hooks/useClusterRecommendationTypes';

import './ClusterRecommendationPanel.scss';

type ClusterRecommendationPanelProps = {
  data: MigrationTargetResponse | null;
  error: Error | null;
  loaded: boolean;
  loading: boolean;
  onSelectCluster?: (clusterName: string) => void;
};

const ScoreBadge: FC<{ score: number }> = ({ score }) => {
  let color: 'green' | 'red' | 'yellow' = 'red';
  if (score >= 70) color = 'green';
  else if (score >= 40) color = 'yellow';
  return <Label color={color}>{score.toFixed(0)}</Label>;
};

const CandidateRow: FC<{
  candidate: CandidateCluster;
  isRecommended: boolean;
  onSelect?: (clusterName: string) => void;
}> = ({ candidate, isRecommended, onSelect }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div
      className="cluster-recommendation-panel__candidate"
      onClick={() => onSelect?.(candidate.cluster)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(candidate.cluster);
        }
      }}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>
            {candidate.cluster}
            {isRecommended && (
              <Label
                className="cluster-recommendation-panel__top-label"
                color="green"
                icon={<CheckCircleIcon />}
              >
                {t('Top pick')}
              </Label>
            )}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <span className="cluster-recommendation-panel__scores">
              <span>
                {t('Score:')} <ScoreBadge score={candidate.totalScore} />
              </span>
              <span>
                {t('CPU:')} <ScoreBadge score={candidate.cpuScore} />
              </span>
              <span>
                {t('Memory:')} <ScoreBadge score={candidate.memoryScore} />
              </span>
              <span>
                {t('Storage:')} <ScoreBadge score={candidate.storageScore} />
              </span>
            </span>
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Available resources')}</DescriptionListTerm>
          <DescriptionListDescription>
            {t('{{cpu}} CPUs, {{memory}} memory', {
              cpu: candidate.availableCPUCores.toFixed(1),
              memory: humanizeBinaryBytes(candidate.availableMemoryBytes).string,
            })}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Storage type')}</DescriptionListTerm>
          <DescriptionListDescription>{candidate.storageType}</DescriptionListDescription>
        </DescriptionListGroup>
        {candidate.matchedStorageClasses?.length > 0 && (
          <DescriptionListGroup>
            <DescriptionListTerm>
              {candidate.matchedStorageClasses.length === 1
                ? t('Matched storage class')
                : t('Matched storage classes')}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {candidate.matchedStorageClasses.join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </div>
  );
};

const ClusterRecommendationPanel: FC<ClusterRecommendationPanelProps> = ({
  data,
  error,
  loaded,
  loading,
  onSelectCluster,
}) => {
  const { t } = useKubevirtTranslation();

  if (loading) {
    return (
      <div className="cluster-recommendation-panel cluster-recommendation-panel--loading">
        <Spinner size="md" />
        <span>{t('Analyzing clusters...')}</span>
      </div>
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

  return (
    <div className="cluster-recommendation-panel">
      <Title headingLevel="h6">{t('Cluster recommendations')}</Title>
      <div className="cluster-recommendation-panel__list">
        {data.candidates.map((candidate) => (
          <CandidateRow
            candidate={candidate}
            isRecommended={candidate.cluster === recommendedCluster}
            key={candidate.cluster}
            onSelect={onSelectCluster}
          />
        ))}
      </div>
      {data.excludedClusters?.length > 0 && (
        <Alert
          isInline
          isPlain
          title={t('{{count}} clusters excluded', { count: data.excludedClusters.length })}
          variant="info"
        >
          {data.excludedClusters.map((ec) => (
            <div key={ec.cluster}>
              <strong>{ec.cluster}</strong>: {ec.reasons?.join(', ')}
            </div>
          ))}
        </Alert>
      )}
    </div>
  );
};

export default ClusterRecommendationPanel;
