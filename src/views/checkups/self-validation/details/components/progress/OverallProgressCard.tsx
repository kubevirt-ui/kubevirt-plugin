import React, { FC, useEffect, useMemo, useState } from 'react';

import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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

import {
  formatElapsedTime,
  getElapsedTimeInSeconds,
  getTestSuiteLabel,
  getTotalSkippedTests,
  OverallProgress,
} from './utils/progressTracker';

import './progress-components.scss';

interface OverallProgressCardProps {
  progress: OverallProgress;
}

const OverallProgressCard: FC<OverallProgressCardProps> = ({ progress }) => {
  const { t } = useKubevirtTranslation();

  const initialElapsedSeconds = useMemo(() => {
    return getElapsedTimeInSeconds(progress?.startTime);
  }, [progress?.startTime]);

  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);

  useEffect(() => {
    setElapsedSeconds(initialElapsedSeconds);
  }, [initialElapsedSeconds]);

  const isJobActive = progress?.startTime && progress.completedSuites < progress.totalSuites;

  useEffect(() => {
    if (!isJobActive) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds(getElapsedTimeInSeconds(progress?.startTime));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isJobActive, progress?.startTime]);

  const elapsedTime = elapsedSeconds > 0 ? formatElapsedTime(elapsedSeconds) : null;

  const totalSkippedTests = useMemo(
    () => getTotalSkippedTests(progress?.suites),
    [progress?.suites],
  );

  const getOverallStatusIcon = () => {
    if (!progress) return null;
    if (progress.failedSuites > 0) {
      return <RedExclamationCircleIcon />;
    }
    if (progress.completedSuites === progress.totalSuites) {
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
        {progress.currentRunningSuites.length > 0 && (
          <Grid>
            <GridItem span={6}>
              <DescriptionList horizontalTermWidthModifier={{ sm: '150px' }} isHorizontal>
                <VirtualMachineDescriptionItem
                  descriptionData={progress.currentRunningSuites
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
          <Progress measureLocation="outside" value={progress.overallProgress} />
        </div>

        <Grid>
          <GridItem span={6}>
            <DescriptionList horizontalTermWidthModifier={{ sm: '100px' }} isHorizontal>
              {elapsedTime && (
                <VirtualMachineDescriptionItem
                  descriptionData={elapsedTime}
                  descriptionHeader={t('Elapsed time')}
                />
              )}
            </DescriptionList>
          </GridItem>
          <GridItem className="flex-end" span={6}>
            <DescriptionList horizontalTermWidthModifier={{ sm: '100px' }} isHorizontal>
              {progress?.lastUpdated && (
                <VirtualMachineDescriptionItem
                  descriptionData={new Date(progress.lastUpdated).toLocaleString()}
                  descriptionHeader={t('Last updated')}
                />
              )}
            </DescriptionList>
          </GridItem>
        </Grid>

        {progress.totalTests !== undefined && (
          <div className="progress-card-margin-top">
            <TestStatistics
              failed={progress.failedTests ?? 0}
              passed={progress.passedTests ?? 0}
              size="large"
              skipped={totalSkippedTests}
              total={progress.totalTests}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default OverallProgressCard;
