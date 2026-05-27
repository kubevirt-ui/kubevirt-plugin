import React, { FC } from 'react';

import ExpandableNamespaceList from '@kubevirt-utils/components/ExpandableNamespaceList/ExpandableNamespaceList';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

import useVMNetworkMatchedNamespaces from '../../hooks/useVMNetworkMatchedNamespaces';

type MatchedNamespacesProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const MatchedNamespaces: FC<MatchedNamespacesProps> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  const [matchingNamespaces, loaded] = useVMNetworkMatchedNamespaces(obj);

  return (
    <ExpandableNamespaceList
      emptyMessage={t('No namespaces matched')}
      loaded={loaded}
      namespaceNames={matchingNamespaces.map(getName)}
    />
  );
};

export default MatchedNamespaces;
