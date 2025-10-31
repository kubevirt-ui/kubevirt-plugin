import React, { FC, useMemo } from 'react';

import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  Grid,
  GridItem,
  Progress,
  ProgressMeasureLocation,
  Spinner,
  Tooltip,
} from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import TestStatistics from '../../../components/shared/TestStatistics';
import {
  COLOR_SKIPPED,
  TEST_STATUS_COMPLETED,
  TEST_STATUS_FAILED,
  TEST_STATUS_PENDING,
  TEST_STATUS_RUNNING,
} from '../../../utils';

import { getTestSuiteLabel, TestSuiteProgress } from './utils/progressTracker';

interface TestSuiteProgressCardProps {
  progress: TestSuiteProgress;
}

const TestSuiteProgressCard: FC<TestSuiteProgressCardProps> = ({ progress }) => {
  const { t } = useKubevirtTranslation();

  const progressStatusMap = useMemo(
    () => ({
      [TEST_STATUS_COMPLETED]: {
        label: t('Completed'),
        ProgressIcon: <GreenCheckCircleIcon />,
      },
      [TEST_STATUS_FAILED]: {
        label: t('Failed'),
        ProgressIcon: <RedExclamationCircleIcon />,
      },
      [TEST_STATUS_PENDING]: {
        label: t('Pending'),
        ProgressIcon: <InProgressIcon style={{ color: COLOR_SKIPPED }} />,
      },
      [TEST_STATUS_RUNNING]: {
        label: t('Running'),
        ProgressIcon: <Spinner size="sm" />,
      },
    }),
    [t],
  );

  const { label: progressLabel, ProgressIcon } =
    progressStatusMap[progress?.status || TEST_STATUS_PENDING];

  const skippedTests = useMemo(() => {
    if (progress.status !== TEST_STATUS_COMPLETED && progress.status !== TEST_STATUS_FAILED) {
      return 0;
    }

    if (
      progress.testsRun === undefined ||
      progress.testsPassed === undefined ||
      progress.testsFailed === undefined
    ) {
      return 0;
    }

    const skipped = progress.testsRun - (progress.testsPassed + progress.testsFailed);
    return Math.max(0, skipped);
  }, [progress.status, progress.testsRun, progress.testsPassed, progress.testsFailed]);

  return (
    <Card
      style={{
        marginBottom: 'var(--pf-t--global--spacer--sm)',
      }}
    >
      <CardHeader>
        <CardTitle>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 'var(--pf-t--global--spacer--sm)',
              marginBottom: 'var(--pf-t--global--spacer--md)',
            }}
          >
            <Tooltip content={progressLabel}>{ProgressIcon}</Tooltip>
            <span>
              {getTestSuiteLabel(progress.suiteName)} {t('tests')}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardBody style={{ paddingBottom: 0 }}>
        <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          <Progress measureLocation={ProgressMeasureLocation.outside} value={progress.progress} />
        </div>
        {progress.duration && (
          <Grid>
            <GridItem span={6}>
              <DescriptionList horizontalTermWidthModifier={{ sm: '100px' }} isHorizontal>
                <VirtualMachineDescriptionItem
                  descriptionData={progress.duration}
                  descriptionHeader={t('Duration')}
                />
              </DescriptionList>
            </GridItem>
          </Grid>
        )}
        {progress.testsRun !== undefined && (
          <TestStatistics
            failed={progress.testsFailed}
            passed={progress.testsPassed}
            size="large"
            skipped={skippedTests}
            total={progress.testsRun}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default TestSuiteProgressCard;
