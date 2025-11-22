import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NamespaceModel } from '@kubevirt-utils/models';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getGroupVersionKindForModel,
  K8sModel,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';

type DescriptionItemNamespaceProps = {
  label?: string;
  model: K8sModel;
  resource: K8sResourceCommon;
};

const DescriptionItemNamespace: FC<DescriptionItemNamespaceProps> = ({
  label,
  model,
  resource,
}) => {
  const { t } = useKubevirtTranslation();

  const namespace = getNamespace(resource);

  return (
    <DescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
      bodyContent={t(
        'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated.',
      )}
      descriptionData={
        <ResourceLink
          groupVersionKind={getGroupVersionKindForModel(NamespaceModel)}
          name={namespace}
        />
      }
      breadcrumb={`${label ?? model.label}.metadata.namespace`}
      descriptionHeader={t('Namespace')}
      isPopover
      moreInfoURL={documentationURL.NAMESPACE_DOC}
    />
  );
};

export default DescriptionItemNamespace;
