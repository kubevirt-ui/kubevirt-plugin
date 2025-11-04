import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';
import { BanIcon } from '@patternfly/react-icons';

import './TestStatistics.scss';

interface TestStatisticsProps {
  failed?: number;
  passed?: number;
  size?: 'large' | 'medium';
  skipped?: number;
  total?: number;
}

interface TestStatisticsItemProps {
  icon?: ReactNode;
  label: string;
  size: 'large' | 'medium';
  value: number;
}

const TestStatisticsItem: FC<TestStatisticsItemProps> = ({ icon, label, size, value }) => (
  <GridItem className="test-statistics__grid-item" span={3}>
    <div className={`test-statistics__item test-statistics__item--${size}`}>
      <div className="test-statistics__item--count">
        {icon && <span className="test-statistics__item--icon">{icon}</span>}
        <span className="test-statistics__item--value">{value}</span>
      </div>
      <div className="test-statistics__item--label">{label}</div>
    </div>
  </GridItem>
);

const TestStatistics: FC<TestStatisticsProps> = ({
  failed = 0,
  passed = 0,
  size = 'medium',
  skipped = 0,
  total,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Grid hasGutter>
      <TestStatisticsItem
        icon={<GreenCheckCircleIcon />}
        label={t('Passed')}
        size={size}
        value={passed}
      />
      <TestStatisticsItem
        icon={<RedExclamationCircleIcon />}
        label={t('Failed')}
        size={size}
        value={failed}
      />
      <TestStatisticsItem icon={<BanIcon />} label={t('Skipped')} size={size} value={skipped} />
      {total !== undefined && <TestStatisticsItem label={t('Total')} size={size} value={total} />}
    </Grid>
  );
};

export default TestStatistics;
