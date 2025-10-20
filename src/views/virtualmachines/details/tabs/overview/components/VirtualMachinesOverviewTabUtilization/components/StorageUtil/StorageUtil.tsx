import React, { FC } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { removeDuplicatesByName } from '@kubevirt-utils/utils/utils';
import { ChartDonutUtilization } from '@patternfly/react-charts/victory';

import { UtilizationBlock } from '../UtilizationBlock';

type StorageUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageUtil: FC<StorageUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const [guestAgentData, loaded] = useGuestOS(vmi);

  const { totalBytes = 0, usedBytes = 0 } =
    removeDuplicatesByName(guestAgentData?.fsInfo?.disks, 'diskName')?.reduce(
      (acc, data) => {
        acc.totalBytes += data?.totalBytes;
        acc.usedBytes += data?.usedBytes;
        return acc;
      },
      { totalBytes: 0, usedBytes: 0 },
    ) || {};

  const usedPercentage = (usedBytes / totalBytes) * 100 || 0;

  const isReady = !Number.isNaN(usedPercentage) && loaded;

  return (
    <UtilizationBlock
      usedOfTotalText={t('Used of {{ total }}', {
        total: xbytes(totalBytes || 0, { fixed: 2, iec: true }),
      })}
      dataTestId="util-summary-storage"
      title={t('Storage')}
      usageValue={xbytes(usedBytes || 0, { fixed: 2, iec: true })}
    >
      <ComponentReady isReady={isReady}>
        <ChartDonutUtilization
          data={{
            x: t('Storage used'),
            y: usedPercentage,
          }}
          labels={({ datum }) =>
            datum.x ? `${datum.x}: ${xbytes(usedBytes || 0, { fixed: 2, iec: true })}` : null
          }
          animate
          constrainToVisibleArea
          style={{ labels: { fontSize: 20 } }}
          subTitle={t('Used')}
          subTitleComponent={<SubTitleChartLabel y={135} />}
          title={`${usedPercentage.toFixed(2) || 0}%`}
          titleComponent={<TitleChartLabel />}
        />
      </ComponentReady>
    </UtilizationBlock>
  );
};

export default StorageUtil;
