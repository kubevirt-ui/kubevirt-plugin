import * as React from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCreationTimestamp } from '@kubevirt-utils/resources/shared';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemCreatedAtProps = {
  label?: string;
  model: K8sModel;
  resource: K8sResourceCommon;
};

const DescriptionItemCreatedAt: React.FC<DescriptionItemCreatedAtProps> = ({
  label,
  model,
  resource,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <DescriptionItem
      bodyContent={t(
        'CreationTimestamp is a timestamp representing the server time when this object was created. It is not guaranteed to be set in happens-before order across separate operations. Clients may not set this value. It is represented in RFC3339 form and is in UTC.',
      )}
      breadcrumb={`${label ?? model.label}.metadata.creationTimestamp`}
      descriptionData={<Timestamp timestamp={getCreationTimestamp(resource)} />}
      descriptionHeader={t('Created at')}
      isPopover
      moreInfoURL={documentationURL.METADATA}
    />
  );
};

export default DescriptionItemCreatedAt;
