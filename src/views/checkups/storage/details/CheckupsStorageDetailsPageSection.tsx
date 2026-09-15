import { type FC } from 'react';

import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, Title } from '@patternfly/react-core';

import CheckupsStorageDetailsLeftList from './CheckupsStorageDetailsLeftList';
import CheckupsStorageDetailsRightList from './CheckupsStorageDetailsRightList';

type CheckupsStorageDetailsPageSectionProps = {
  configMap: IoK8sApiCoreV1ConfigMap;
  job: IoK8sApiBatchV1Job;
};

const CheckupsStorageDetailsPageSection: FC<CheckupsStorageDetailsPageSectionProps> = ({
  configMap,
  job,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Title className="co-section-heading" headingLevel="h2">
        {t('Storage checkup details')}
      </Title>
      <Grid>
        <CheckupsStorageDetailsLeftList configMap={configMap} job={job} />
        <CheckupsStorageDetailsRightList configMap={configMap} job={job} />
      </Grid>
    </>
  );
};

export default CheckupsStorageDetailsPageSection;
