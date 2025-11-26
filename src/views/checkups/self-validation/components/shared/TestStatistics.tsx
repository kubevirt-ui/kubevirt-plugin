import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Grid } from '@patternfly/react-core';
import { BanIcon } from '@patternfly/react-icons';

import TestStatisticsItem from './TestStatisticsItem';

import './TestStatistics.scss';

type TestStatisticsProps = {
  failed?: number;
  passed?: number;
  size?: 'large' | 'medium';
  skipped?: number;
  total?: number;
};

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
