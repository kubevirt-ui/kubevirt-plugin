import React, { CSSProperties, FC, ReactNode } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import StatusScoreList, { StatusScoreItem } from '../../../shared/StatusScoreList/StatusScoreList';
import { SeverityCount } from '../../hooks/clusterMetricConstants';

import LoadingSkeleton from './LoadingSkeleton';
import SeverityCountList from './SeverityCountList';

import './TwoColumnCard.scss';

type TwoColumnCardProps = {
  /** Additional content below the left column */
  bottomLeftContent?: ReactNode;
  /** Column ratio override (CSS grid-template-columns) */
  gridColumns?: string;
  /** Actions rendered in the card header (e.g. "View all" link) */
  headerActions?: ReactNode;
  /** Help popover body text */
  helpContent?: string;
  /** Whether the data is still loading */
  isLoading?: boolean;
  /** Items for the right-column StatusScoreList */
  items: StatusScoreItem[];
  /** Override the left column entirely (e.g. for a chart) */
  leftContent?: ReactNode;
  /** Header label for the name column in StatusScoreList */
  nameHeader: string;
  /** Optional title displayed above the right column */
  rightTitle?: string;
  /** Header label for the score column in StatusScoreList */
  scoreHeader: string;
  /** Severity counts for the default left column */
  severityCounts?: SeverityCount[];
  /** Label for severity count items (defaults to "clusters") */
  severityItemLabel?: string;
  /** Card title */
  title: string;
};

const TwoColumnCard: FC<TwoColumnCardProps> = ({
  bottomLeftContent,
  gridColumns,
  headerActions,
  helpContent,
  isLoading,
  items,
  leftContent,
  nameHeader,
  rightTitle,
  scoreHeader,
  severityCounts,
  severityItemLabel,
  title,
}) => {
  const style = gridColumns
    ? ({ '--two-column-card--columns': gridColumns } as CSSProperties)
    : undefined;

  return (
    <Card className="two-column-card" isCompact>
      <CardHeader
        actions={
          headerActions
            ? {
                actions: headerActions,
                hasNoOffset: false,
              }
            : undefined
        }
      >
        <CardTitle className={helpContent ? 'two-column-card__title' : undefined}>
          {title}
          {helpContent && <HelpTextIcon bodyContent={helpContent} />}
        </CardTitle>
      </CardHeader>
      <CardBody>
        {!isLoading ? (
          <div className="two-column-card__layout" style={style}>
            <div className="two-column-card__left">
              {leftContent ?? (
                <SeverityCountList
                  itemLabel={severityItemLabel}
                  severityCounts={severityCounts ?? []}
                />
              )}
              {bottomLeftContent}
            </div>
            <div className="two-column-card__right">
              {rightTitle && <div className="two-column-card__right-title">{rightTitle}</div>}
              <StatusScoreList items={items} nameHeader={nameHeader} scoreHeader={scoreHeader} />
            </div>
          </div>
        ) : (
          <LoadingSkeleton />
        )}
      </CardBody>
    </Card>
  );
};

export default TwoColumnCard;
