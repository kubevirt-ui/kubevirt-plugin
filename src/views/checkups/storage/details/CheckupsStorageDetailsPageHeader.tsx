import React, { FC } from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FlexItem, Title } from '@patternfly/react-core';

import CheckupsDetailsPageBreadcrumb from '../../components/CheckupsDetailsPageBreadcrumb';
import { CHECKUP_URLS } from '../../utils/constants';
import CheckupsStorageActions from '../components/CheckupsStorageActions';

type CheckupsStorageDetailsPageHeaderProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  jobs: IoK8sApiBatchV1Job[];
};

const CheckupsStorageDetailsPageHeader: FC<CheckupsStorageDetailsPageHeaderProps> = ({
  configMap,
  jobs,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DetailsPageTitle
      breadcrumb={
        <CheckupsDetailsPageBreadcrumb
          checkupType={CHECKUP_URLS.STORAGE}
          detailsLabel={t('Storage checkup details')}
          parentLabel={t('Storage checkup')}
        />
      }
    >
      {configMap && (
        <PaneHeading>
          <Title headingLevel="h1">{configMap?.metadata?.name}</Title>
          <FlexItem>
            <CheckupsStorageActions configMap={configMap} jobs={jobs} />
          </FlexItem>
        </PaneHeading>
      )}
    </DetailsPageTitle>
  );
};

export default CheckupsStorageDetailsPageHeader;
