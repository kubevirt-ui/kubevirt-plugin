import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { extractConfigMapName } from 'src/views/checkups/utils/utils';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

export const getRunningCheckupErrorMessage = (
  t: (key: string) => string,
  runningJobs: IoK8sApiBatchV1Job[],
  onClose?: () => void,
): ReactElement => {
  const jobLinks = runningJobs.flatMap((job, index) => {
    const configMapInfo = extractConfigMapName(job);
    const jobName = job?.metadata?.name || t('Unknown');
    const key = job?.metadata?.name ?? `job-${index}`;
    const linkElement = configMapInfo ? (
      <Link
        to={createURL(
          `self-validation/${configMapInfo.name}`,
          `/k8s/ns/${configMapInfo.namespace}/checkups`,
        )}
        key={key}
        onClick={() => onClose?.()}
      >
        <strong>{configMapInfo.name}</strong>
      </Link>
    ) : (
      <strong key={key}>{jobName}</strong>
    );

    return index > 0 ? [', ', linkElement] : [linkElement];
  });

  return (
    <>
      {t('Cannot run a self validation checkup as the following checkup job is already running:')}{' '}
      {jobLinks}. {t('You can only run a single self validation checkup at a time.')}
    </>
  );
};
