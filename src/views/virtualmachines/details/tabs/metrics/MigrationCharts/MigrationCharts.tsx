import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MigrationThresholdChart from '@kubevirt-utils/components/Charts/MigrationUtil/MigrationThresholdChart';
import MigrationThresholdChartDiskRate from '@kubevirt-utils/components/Charts/MigrationUtil/MigrationThresholdChartDiskRate';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import MigrationProgressStatus from './MigrationProgressStatus';

type MigrationChartsProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationCharts: React.FC<MigrationChartsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack>
      <StackItem>
        <Grid>
          <GridItem span={6}>
            <Card>
              <CardTitle>
                {t('Migration chart')}
                <HelpTextIcon
                  bodyContent={t(
                    'Displays real-time metrics of the live migration process, such as memory transfer and downtime.',
                  )}
                  helpIconClassName="pf-v6-u-ml-xs"
                  position={PopoverPosition.right}
                />
              </CardTitle>
              <CardBody>
                <MigrationThresholdChart vmi={vmi} />
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card>
              <CardTitle>
                {t('KV data transfer rate')}
                <HelpTextIcon
                  bodyContent={t(
                    'Shows the data throughput (MB/s) during the live migration between source and destination nodes.',
                  )}
                  helpIconClassName="pf-v6-u-ml-xs"
                  position={PopoverPosition.right}
                />
              </CardTitle>
              <CardBody>
                <MigrationThresholdChartDiskRate vmi={vmi} />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </StackItem>
      <MigrationProgressStatus vmi={vmi} />
    </Stack>
  );
};

export default MigrationCharts;
