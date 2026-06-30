import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NamespaceModel } from '@kubevirt-utils/models';
import { getGroupVersionKindForModel, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Flex } from '@patternfly/react-core';

const InvalidNADNamespace: FC<{ allowedNamespaces: string[] }> = ({ allowedNamespaces }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
      <p>{t('NetworkAttachmentDefinition namespace should be one of:')}</p>
      {allowedNamespaces.map((ns) => (
        <ResourceLink
          groupVersionKind={getGroupVersionKindForModel(NamespaceModel)}
          key={ns}
          linkTo={false}
          name={ns}
        />
      ))}
    </Flex>
  );
};

export default InvalidNADNamespace;
