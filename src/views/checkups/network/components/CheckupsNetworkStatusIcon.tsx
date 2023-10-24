import React, { FC } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { CheckCircleIcon, ExclamationCircleIcon, SyncAltIcon } from '@patternfly/react-icons';

import { getConfigMapStatus, getJobStatus, NetworkCheckupsStatus } from '../utils/utils';

import './checkups-network-status.icon.scss';

type CheckupsNetworkStatusIconProps = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
  onlyJob?: boolean;
};

const CheckupsNetworkStatusIcon: FC<CheckupsNetworkStatusIconProps> = ({
  configMap,
  job,
  onlyJob = false,
}) => {
  const { t } = useKubevirtTranslation();
  const statusJob = getJobStatus(job);
  const statusConfigMap = getConfigMapStatus(configMap, statusJob);

  const Icon = {
    [NetworkCheckupsStatus.Done]: (
      <>
        <CheckCircleIcon color="green" />
        {t('Succeeded')}
      </>
    ),
    [NetworkCheckupsStatus.Failed]: (
      <>
        <ExclamationCircleIcon color="red" /> {t('Failed')}
      </>
    ),
    [NetworkCheckupsStatus.Running]: (
      <>
        <SyncAltIcon />
        {t('Running')}
      </>
    ),
  };

  if (!configMap && !job) return <>{NO_DATA_DASH}</>;

  return (
    <div className="CheckupsNetworkStatusIcon--main">
      {Icon[onlyJob ? statusJob : statusConfigMap]}
    </div>
  );
};

export default CheckupsNetworkStatusIcon;
