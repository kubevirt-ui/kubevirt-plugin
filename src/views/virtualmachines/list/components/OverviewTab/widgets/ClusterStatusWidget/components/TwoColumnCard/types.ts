import { CSSProperties, ReactNode } from 'react';

import { OLSPromptType } from '@lightspeed/utils/prompts';

import { StatusScoreItem } from '../../../shared/StatusScoreList/StatusScoreList';
import { SeverityCount } from '../../hooks/clusterMetricConstants';

export type SeverityCountListProps = {
  itemLabel?: string;
  severityCounts: SeverityCount[];
};

export type TwoColumnCardBodyProps = {
  bottomLeftContent?: ReactNode;
  isLoading?: boolean;
  items: StatusScoreItem[];
  leftContent?: ReactNode;
  nameHeader: string;
  noDataMessage?: string;
  rightTitle?: string;
  scoreHeader: string;
  severityCounts?: SeverityCount[];
  severityItemLabel?: string;
  style?: CSSProperties;
};

export type TwoColumnCardProps = {
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
  /** When set, replaces card body content with centered muted message */
  noDataMessage?: string;
  /** Prompt type for lightspeed */
  olsPromptType?: OLSPromptType;
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
