import React, { FC } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

type StorageUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageUtil: FC<StorageUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  const [guestAgentData, loaded] = useGuestOS(vmi);

  const { totalBytes = 0, usedBytes = 0 } =
    guestAgentData?.fsInfo?.disks?.reduce(
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
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('Storage')}</div>
        <div className="util-summary" data-test-id="util-summary-storage">
          <div className="util-summary-value">
            {xbytes(usedBytes || 0, { iec: true, fixed: 0 })}
          </div>
          <div className="util-summary-text text-muted">
            <div>{t('Used of ')}</div>
            <div>{xbytes(totalBytes || 0, { iec: true, fixed: 0 })}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        <ComponentReady isReady={isReady}>
          <ChartDonutUtilization
            constrainToVisibleArea
            animate
            data={{
              x: t('Storage used'),
              y: usedPercentage,
            }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${xbytes(usedBytes || 0, { iec: true, fixed: 2 })}` : null
            }
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${usedPercentage.toFixed(2) || 0}%`}
            style={{ labels: { fontSize: 20 } }}
          />
        </ComponentReady>
      </div>
    </div>
  );
};

export default StorageUtil;
