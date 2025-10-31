import React, { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { extractConfigMapName } from 'src/views/checkups/utils/utils';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

export const getRunningCheckupErrorMessage = (
  t: (key: string) => string,
  runningJobs: IoK8sApiBatchV1Job[],
  onClose?: () => void,
): ReactElement => {
  const jobLinks = runningJobs
    .map((job) => {
      const configMapInfo = extractConfigMapName(job);
      if (!configMapInfo) {
        return <strong key={job.metadata.name}>{job.metadata.name}</strong>;
      }

      const linkUrl = createURL(
        `self-validation/${configMapInfo.name}`,
        `/k8s/ns/${configMapInfo.namespace}/checkups`,
      );

      return (
        <Link
          onClick={() => {
            onClose?.();
          }}
          key={job.metadata.name}
          to={linkUrl}
        >
          <strong>{configMapInfo.name}</strong>
        </Link>
      );
    })
    .reduce((acc, link, index) => {
      if (index > 0) {
        acc.push(', ');
      }
      acc.push(link);
      return acc;
    }, [] as ReactNode[]);

  return (
    <>
      {t('Cannot run a self validation checkup as the following checkup job is already running:')}{' '}
      {jobLinks}. {t('You can only run a single self validation checkup at a time.')}
    </>
  );
};
