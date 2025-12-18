import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { extractConfigMapName } from 'src/views/checkups/utils/utils';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getSelfValidationCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';

export const getRunningCheckupErrorMessage = (
  t: (key: string) => string,
  runningJobs: IoK8sApiBatchV1Job[],
  onClose?: () => void,
): ReactElement => {
  const jobLinks = runningJobs.flatMap((job, index) => {
    const configMapInfo = extractConfigMapName(job);

    const jobName = getName(job) || t('Unknown');
    const key = getName(job) ?? `job-${index}`;
    const cluster = getCluster(job);
    const url = getSelfValidationCheckupURL(getName(job), getNamespace(job), cluster);

    const linkElement = configMapInfo ? (
      <Link key={key} onClick={() => onClose?.()} to={url}>
        <strong>{configMapInfo.name}</strong>
      </Link>
    ) : (
      <strong key={key}>{jobName}</strong>
    );

    return index > 0 ? [', ', linkElement] : [linkElement];
  });

  return (
    <>
      {t('The following self validation checkup job is already running:')}
      <span style={{ marginLeft: '0.25rem' }}>{jobLinks}</span>.{' '}
    </>
  );
};
