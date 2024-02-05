import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HealthItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import useKubevirtStorageOperatorCSVs from '../hooks/useKubevirtStorageOperatorCSVs';
import { getOverallStorageStatus, getStorageOperatorHealthStatus } from '../utils';

import StatusCardStoragePopover from './StatusStorageCardPopover';

const StorageHealthItem = () => {
  const { t } = useKubevirtTranslation();
  const { loaded, loadErrors, lsoCSV, odfCSV } = useKubevirtStorageOperatorCSVs();

  const lsoState = getStorageOperatorHealthStatus(lsoCSV, loaded, loadErrors);
  const odfState = getStorageOperatorHealthStatus(odfCSV, loaded, loadErrors);
  const status = getOverallStorageStatus(lsoState, odfState, loaded, loadErrors);

  return (
    <HealthItem
      details={''}
      popupTitle={t('Storage requirements')}
      state={status.state}
      title={t('Storage')}
    >
      <StatusCardStoragePopover lsoState={lsoState} odfState={odfState} />
    </HealthItem>
  );
};

export default StorageHealthItem;
