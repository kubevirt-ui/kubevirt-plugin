import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

type DescriptionItemNameProps = {
  label?: string;
  model: K8sModel;
  resource: K8sResourceCommon;
};

const DescriptionItemName: FC<DescriptionItemNameProps> = ({ label, model, resource }) => {
  const { t } = useKubevirtTranslation();

  const name = getName(resource);

  return (
    <DescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L96
      bodyContent={t(
        'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. Cannot be updated.',
      )}
      breadcrumb={`${label ?? model.label}.metadata.name`}
      data-test-id={`${name}-name`}
      descriptionData={name}
      descriptionHeader={t('Name')}
      isPopover
      moreInfoURL={documentationURL.NAME}
    />
  );
};

export default DescriptionItemName;
