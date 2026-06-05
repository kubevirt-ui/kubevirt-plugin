import React, { ComponentType, FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Icon,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';

import { DiagnosticSeverity, DiagnosticSeverityCounts } from '../../utils/types';

import './diagnostics-overview-cards.scss';

type DiagnosticsOverviewCardsProps = {
  activeSeverity: DiagnosticSeverity | null;
  counts: DiagnosticSeverityCounts;
  onSeverityChange: (severity: DiagnosticSeverity | null) => void;
};

type CardConfig = {
  colorClass: string;
  count: number;
  icon: ComponentType;
  label: string;
  severity: DiagnosticSeverity | null;
  status: 'danger' | 'info' | 'success' | 'warning';
};

const DiagnosticsOverviewCards: FC<DiagnosticsOverviewCardsProps> = ({
  activeSeverity,
  counts,
  onSeverityChange,
}) => {
  const { t } = useKubevirtTranslation();

  const cards: CardConfig[] = [
    {
      colorClass: 'diagnostics-overview-cards__card--critical',
      count: counts.critical,
      icon: ExclamationCircleIcon,
      label: t('Critical'),
      severity: 'critical',
      status: 'danger',
    },
    {
      colorClass: 'diagnostics-overview-cards__card--warning',
      count: counts.warnings,
      icon: ExclamationTriangleIcon,
      label: t('Warnings'),
      severity: 'warning',
      status: 'warning',
    },
    {
      colorClass: 'diagnostics-overview-cards__card--healthy',
      count: counts.healthy,
      icon: CheckCircleIcon,
      label: t('Healthy'),
      severity: 'healthy',
      status: 'success',
    },
    {
      colorClass: 'diagnostics-overview-cards__card--all',
      count: counts.all,
      icon: InfoCircleIcon,
      label: t('All statuses'),
      severity: null,
      status: 'info',
    },
  ];

  return (
    <Flex className="diagnostics-overview-cards">
      {cards.map(({ colorClass, count, icon: CardIcon, label, severity, status }) => {
        const isSelected = activeSeverity === severity;

        return (
          <FlexItem flex={{ default: 'flex_1' }} key={label}>
            <Card
              className={`diagnostics-overview-cards__card ${colorClass} ${
                isSelected ? 'diagnostics-overview-cards__card--selected' : ''
              }`}
              aria-label={t('{{label}}, {{count}}', { count, label })}
              aria-pressed={isSelected}
              data-test={`diagnostics-card-${severity ?? 'all'}`}
              isClickable
              isCompact
              isSelected={isSelected}
              onClick={() => onSeverityChange(severity)}
              role="button"
            >
              <CardTitle>
                <Split hasGutter>
                  <SplitItem>
                    <Icon status={status}>
                      <CardIcon />
                    </Icon>
                  </SplitItem>
                  <SplitItem>{label}</SplitItem>
                </Split>
              </CardTitle>
              <CardBody>
                <span className="diagnostics-overview-cards__count">{count}</span>
              </CardBody>
            </Card>
          </FlexItem>
        );
      })}
    </Flex>
  );
};

export default DiagnosticsOverviewCards;
