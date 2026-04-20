import React, { FCC } from 'react';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Icon as PFIcon, Spinner } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';

import { CheckupsStatus, getConfigMapStatus, getJobStatus } from './utils/utils';

import './checkups.scss';

type CheckupsStatusIconProps = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  job?: IoK8sApiBatchV1Job;
  onlyJob?: boolean;
};

const CheckupsStatusIcon: FCC<CheckupsStatusIconProps> = ({ configMap, job, onlyJob = false }) => {
  const { t } = useKubevirtTranslation();
  const jobStatus = getJobStatus(job);
  const configMapStatus = getConfigMapStatus(configMap, jobStatus);

  const Icon = {
    [CheckupsStatus.Deleting]: (
      <>
        <PFIcon>
          <Spinner size="sm" />
        </PFIcon>
        {t('Deleting')}
      </>
    ),
    [CheckupsStatus.Done]: (
      <>
        <PFIcon status="success">
          <CheckCircleIcon />
        </PFIcon>
        {t('Succeeded')}
      </>
    ),
    [CheckupsStatus.Failed]: (
      <>
        <PFIcon status="danger">
          <ExclamationCircleIcon />
        </PFIcon>
        {t('Failed')}
      </>
    ),
    [CheckupsStatus.Pending]: (
      <>
        <PFIcon status="info">
          <InProgressIcon />
        </PFIcon>
        {t('Pending')}
      </>
    ),
    [CheckupsStatus.Running]: (
      <>
        <GreenRunningIcon />
        {t('Running')}
      </>
    ),
  };

  if (!configMap && !job) return <>{NO_DATA_DASH}</>;

  const status = onlyJob ? jobStatus : configMapStatus;

  return (
    <span className="CheckupsStatusIcon--main">{Icon[status] ?? <span>{t('Unknown')}</span>}</span>
  );
};

export default CheckupsStatusIcon;
