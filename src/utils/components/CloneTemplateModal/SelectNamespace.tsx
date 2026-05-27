import React, { FC } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import Loading from '../Loading/Loading';

type SelectNamespaceProps = {
  cluster?: string;
  selectedNamespace: string;
  setSelectedNamespace: (newNamespace: string) => void;
};

const SelectNamespace: FC<SelectNamespaceProps> = ({
  cluster,
  selectedNamespace,
  setSelectedNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  const [namespaceNames, namespacesLoaded] = useNamespaces(cluster);

  if (!namespacesLoaded) return <Loading />;

  return (
    <InlineFilterSelect
      options={namespaceNames?.map((namespaceName) => ({
        children: namespaceName,
        groupVersionKind: modelToGroupVersionKind(NamespaceModel),
        value: namespaceName,
      }))}
      placeholder={t('Select namespace')}
      selected={selectedNamespace}
      setSelected={setSelectedNamespace}
      toggleProps={{ isFullWidth: true }}
    />
  );
};

export default SelectNamespace;
