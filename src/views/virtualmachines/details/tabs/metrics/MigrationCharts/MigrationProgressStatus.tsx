import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useMigrationPercentage from '@kubevirt-utils/resources/vm/hooks/useMigrationPercentage';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { getMigrationProgressVariant } from '../utils/utils';

type MigrationProgressStatusProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationProgressStatus: React.FC<MigrationProgressStatusProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const { endTimestamp, isFailed, percentage } = useMigrationPercentage(vmi);

  const progressStatus = getMigrationProgressVariant(percentage, isFailed);

  return (
    <StackItem>
      <Card>
        <CardTitle>{t('LiveMigration progress')}</CardTitle>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              {endTimestamp && (
                <>
                  {t('Complete time:')}{' '}
                  <Timestamp
                    className="virtual-machine-metrics-tab__migration-completed-timestamp"
                    simple
                    timestamp={endTimestamp}
                  />
                </>
              )}
            </StackItem>
            <StackItem>
              <Progress
                measureLocation={ProgressMeasureLocation.top}
                value={percentage}
                variant={progressStatus}
              />
            </StackItem>
          </Stack>
        </CardBody>
      </Card>
    </StackItem>
  );
};

export default MigrationProgressStatus;
