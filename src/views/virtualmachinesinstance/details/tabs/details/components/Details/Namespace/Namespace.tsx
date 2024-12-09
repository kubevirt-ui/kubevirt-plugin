import React, { FC } from 'react';

import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type NamespaceProps = {
  namespace: string;
};

const Namespace: FC<NamespaceProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  return (
    <VirtualMachineDescriptionItem
      // body-content text copied from: https://github.com/kubevirt-ui/kubevirt-api/blob/main/containerized-data-importer/models/V1ObjectMeta.ts#L102-L104
      bodyContent={t(
        'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
      )}
      breadcrumb="VirtualMachineInstance.metadata.namespace"
      descriptionData={<ResourceLink kind="Namespace" name={namespace} />}
      descriptionHeader={t('Namespace')}
      isPopover
      moreInfoURL={documentationURL.NAMESPACE_DOC}
    />
  );
};

export default Namespace;
