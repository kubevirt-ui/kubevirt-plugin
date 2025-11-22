import React, { FC } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Title } from '@patternfly/react-core';

import CheckupsDetailsPageBreadcrumb from '../../components/CheckupsDetailsPageBreadcrumb';
import { CHECKUP_URLS } from '../../utils/constants';
import CheckupsNetworkActions from '../components/CheckupsNetworkActions';

type CheckupsNetworkDetailsPageHeaderProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  jobs: IoK8sApiBatchV1Job[];
};

const CheckupsNetworkDetailsPageHeader: FC<CheckupsNetworkDetailsPageHeaderProps> = ({
  configMap,
  jobs,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DetailsPageTitle
      breadcrumb={
        <CheckupsDetailsPageBreadcrumb
          checkupType={CHECKUP_URLS.NETWORK}
          detailsLabel={t('Latency checkup details')}
          parentLabel={t('Network latency checkup')}
        />
      }
    >
      {configMap && (
        <PaneHeading>
          <Title headingLevel="h1">{configMap?.metadata?.name}</Title>
          <CheckupsNetworkActions configMap={configMap} jobs={jobs} />
        </PaneHeading>
      )}
    </DetailsPageTitle>
  );
};

export default CheckupsNetworkDetailsPageHeader;
