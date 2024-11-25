import React, { FC } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PodModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import ExternalLink from '../ExternalLink/ExternalLink';

import { exportInProgress } from './utils';

type ViewPodLogLinkProps = {
  pod: IoK8sApiCoreV1Pod;
};

const ViewPodLogLink: FC<ViewPodLogLinkProps> = ({ pod }) => {
  const { t } = useKubevirtTranslation();

  if (isEmpty(pod) || exportInProgress(pod)) return null;

  const podLogsLink = `${getResourceUrl({ model: PodModel, resource: pod })}/logs`;

  return <ExternalLink href={podLogsLink}>{t('View pod logs')}</ExternalLink>;
};

export default ViewPodLogLink;
