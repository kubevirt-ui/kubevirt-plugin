import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';

type DescriptionItemClusterProps = {
  resource: K8sResourceCommon;
};

const DescriptionItemCluster: FC<DescriptionItemClusterProps> = ({ resource }) => {
  const { t } = useKubevirtTranslation();

  const cluster = getCluster(resource);

  return (
    <DescriptionItem
      data-test-id="description-cluster"
      descriptionData={cluster}
      descriptionHeader={t('Cluster')}
      isPopover={false}
    />
  );
};

export default DescriptionItemCluster;
