import React, { FC, useEffect, useMemo, useState } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { formatElapsedTime, getElapsedTimeInSeconds } from '@kubevirt-utils/utils/elapsedTime';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  Grid,
  GridItem,
  Progress,
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import TestStatistics from '../../../components/shared/TestStatistics';

import { getTestSuiteLabel, getTotalSkippedTests } from './utils/progressTracker';
import type { OverallProgress } from './utils/types';

import './progress-components.scss';

type OverallProgressCardProps = {
  progress: OverallProgress;
};

const OverallProgressCard: FC<OverallProgressCardProps> = ({ progress: overallProgress }) => {
  const { t } = useKubevirtTranslation();

  const initialElapsedSeconds = useMemo(() => {
    return getElapsedTimeInSeconds(overallProgress?.startTime);
  }, [overallProgress?.startTime]);

  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);

  useEffect(() => {
    setElapsedSeconds(initialElapsedSeconds);
  }, [initialElapsedSeconds]);

  const isJobActive =
    overallProgress?.startTime && overallProgress.completedSuites < overallProgress.totalSuites;

  useEffect(() => {
    if (!isJobActive) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds(getElapsedTimeInSeconds(overallProgress?.startTime));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isJobActive, overallProgress?.startTime]);

  const elapsedTime = elapsedSeconds > 0 ? formatElapsedTime(t, elapsedSeconds) : null;

  const totalSkippedTests = useMemo(
    () => getTotalSkippedTests(overallProgress?.suites),
    [overallProgress?.suites],
  );

  const getOverallStatusIcon = () => {
    if (!overallProgress) return null;
    if (overallProgress.failedSuites > 0) {
      return <RedExclamationCircleIcon />;
    }
    if (overallProgress.completedSuites === overallProgress.totalSuites) {
      return <GreenCheckCircleIcon />;
    }
    return <InProgressIcon className="icon-color-in-progress" />;
  };

  const statusIcon = getOverallStatusIcon();

  return (
    <Card className="overall-progress-card">
      <CardHeader>
        <div className="flex-center">
          {statusIcon}
          <CardTitle>{t('Checkup progress')}</CardTitle>
        </div>
        {overallProgress?.currentRunningSuites?.length > 0 && (
          <Grid>
            <GridItem span={6}>
              <DescriptionList horizontalTermWidthModifier={{ sm: '150px' }} isHorizontal>
                <DescriptionItem
                  descriptionData={(overallProgress.currentRunningSuites ?? [])
                    .map((currentSuite) => getTestSuiteLabel(currentSuite.suiteName))
                    .join(', ')}
                  descriptionHeader={t('Currently running')}
                />
              </DescriptionList>
            </GridItem>
          </Grid>
        )}
      </CardHeader>
      <CardBody>
        <div className="progress-card-spacing-md">
          <Progress measureLocation="outside" value={overallProgress?.progress ?? 0} />
        </div>

        <Grid>
          <GridItem span={6}>
            <DescriptionList horizontalTermWidthModifier={{ sm: '100px' }} isHorizontal>
              {elapsedTime && (
                <DescriptionItem
                  descriptionData={elapsedTime}
                  descriptionHeader={t('Elapsed time')}
                />
              )}
            </DescriptionList>
          </GridItem>
          <GridItem className="flex-end" span={6}>
            <DescriptionList horizontalTermWidthModifier={{ sm: '100px' }} isHorizontal>
              {overallProgress?.lastUpdated && (
                <DescriptionItem
                  descriptionData={new Date(overallProgress.lastUpdated).toLocaleString()}
                  descriptionHeader={t('Last updated')}
                />
              )}
            </DescriptionList>
          </GridItem>
        </Grid>

        {overallProgress.totalTests !== undefined && (
          <div className="progress-card-margin-top">
            <TestStatistics
              failed={overallProgress.failedTests ?? 0}
              passed={overallProgress.passedTests ?? 0}
              size="large"
              skipped={totalSkippedTests}
              total={overallProgress.totalTests}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OverallProgressCard;
