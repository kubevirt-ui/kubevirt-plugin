import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';

import { CandidateCluster } from '../hooks/useClusterRecommendationTypes';

import ScoreBadge from './ScoreBadge';

type CandidateRowProps = {
  candidate: CandidateCluster;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect?: (clusterName: string) => void;
};

const CandidateRow: FC<CandidateRowProps> = ({
  candidate,
  isRecommended,
  isSelected,
  onSelect,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Card
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(candidate.cluster);
        }
      }}
      style={
        {
          '--pf-v6-c-card--BackgroundColor': 'rgba(6, 108, 196, 0.15)',
          border: '1px solid var(--pf-t--global--color--nonstatus--blue--default, #06c)',
        } as React.CSSProperties
      }
      isClickable={!!onSelect}
      isCompact
      isSelectable={!!onSelect}
      isSelected={isSelected}
      onClick={() => onSelect?.(candidate.cluster)}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <CardBody>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {candidate.cluster}
              {isRecommended && (
                <Label className="pf-v6-u-ml-sm" color="green" icon={<CheckCircleIcon />}>
                  {t('Top pick')}
                </Label>
              )}
            </DescriptionListTerm>
            <DescriptionListDescription>
              <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  {t('Score:')} <ScoreBadge score={candidate.totalScore} />
                </FlexItem>
                <FlexItem>
                  {t('CPU:')} <ScoreBadge score={candidate.cpuScore} />
                </FlexItem>
                <FlexItem>
                  {t('Memory:')} <ScoreBadge score={candidate.memoryScore} />
                </FlexItem>
                <FlexItem>
                  {t('Storage:')} <ScoreBadge score={candidate.storageScore} />
                </FlexItem>
              </Flex>
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
      </CardBody>
    </Card>
  );
};

export default CandidateRow;
