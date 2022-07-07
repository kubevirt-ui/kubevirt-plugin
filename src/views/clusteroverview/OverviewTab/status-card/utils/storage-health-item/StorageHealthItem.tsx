import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HealthItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import useKubevirtStorageOperatorCSVs from '../hooks/useKubevirtStorageOperatorCSVs';
import { getOverallStorageStatus, getStorageOperatorHealthStatus } from '../utils';

import StatusCardStoragePopover from './StatusStorageCardPopover';

const StorageHealthItem = () => {
  const { t } = useKubevirtTranslation();
  const { lsoCSV, odfCSV, loaded, loadErrors } = useKubevirtStorageOperatorCSVs();

  const lsoState = getStorageOperatorHealthStatus(lsoCSV, loaded, loadErrors, t);
  const odfState = getStorageOperatorHealthStatus(odfCSV, loaded, loadErrors, t);
  const status = getOverallStorageStatus(lsoState, odfState, loaded, loadErrors);

  return (
    <HealthItem
      title={t('Storage')}
      state={status.state}
      details={''}
      popupTitle={t('Storage requirements')}
    >
      <StatusCardStoragePopover lsoState={lsoState} odfState={odfState} />
    </HealthItem>
  );
};

export default StorageHealthItem;
