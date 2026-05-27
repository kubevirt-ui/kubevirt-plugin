import React, { FC, JSX, useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { getNamespaceOptions } from '@kubevirt-utils/components/NamespaceDropdown/utils/utils';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type NamespaceDropdownProps = {
  cluster?: string;
  includeAllNamespaces?: boolean;
  isDisabled?: boolean;
  onChange: (namespace: string) => void;
  selectedNamespace: string;
  useConsoleFavorites?: boolean;
};

const NamespaceDropdown: FC<NamespaceDropdownProps> = ({
  cluster,
  includeAllNamespaces = true,
  isDisabled = false,
  onChange,
  selectedNamespace,
  useConsoleFavorites = true,
}): JSX.Element => {
  const [namespaces] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    namespaced: false,
  });

  const [bookmarks, updateBookmarks, bookmarksLoaded] = useConsoleNamespaceBookmarks(cluster);

  const options = useMemo(() => {
    if (!useConsoleFavorites || !bookmarksLoaded) {
      return getNamespaceOptions(includeAllNamespaces, namespaces, {}, undefined);
    }
    return getNamespaceOptions(includeAllNamespaces, namespaces, bookmarks, updateBookmarks);
  }, [
    includeAllNamespaces,
    namespaces,
    bookmarks,
    updateBookmarks,
    useConsoleFavorites,
    bookmarksLoaded,
  ]);

  return (
    <div className="namespace-dropdown">
      <InlineFilterSelect
        options={options}
        selected={selectedNamespace || ALL_NAMESPACES}
        setSelected={onChange}
        toggleProps={{ isDisabled, isFullWidth: true }}
      />
    </div>
  );
};

export default NamespaceDropdown;
