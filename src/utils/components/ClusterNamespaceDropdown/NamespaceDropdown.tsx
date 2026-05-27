import React, { FC, JSX, useMemo } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Dropdown, {
  DropdownConfig,
} from '@kubevirt-utils/components/ClusterNamespaceDropdown/Dropdown/Dropdown';
import { ALL_NAMESPACES_KEY } from '@kubevirt-utils/hooks/constants';
import useConsoleNamespaceBookmarks from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/useConsoleNamespaceBookmarks';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type NamespaceDropdownProps = {
  cluster?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  includeAllNamespaces?: boolean;
  onChange: (namespace: string) => void;
  selectedNamespace: string;
};

const NamespaceDropdown: FC<NamespaceDropdownProps> = ({
  cluster,
  disabled = false,
  disabledTooltip,
  includeAllNamespaces = true,
  onChange,
  selectedNamespace,
}): JSX.Element => {
  const { t } = useKubevirtTranslation();

  const [namespaces, namespacesLoaded] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    namespaced: false,
  });

  const [bookmarks, updateBookmarks, bookmarksLoaded] = useConsoleNamespaceBookmarks(cluster);

  const config: DropdownConfig = useMemo(
    () => ({
      allItemsKey: ALL_NAMESPACES_KEY,
      allItemsTitle: t('All namespaces'),
      cssPrefix: 'co-namespace-dropdown',
      dataTestId: 'namespace-dropdown-menu',
      itemsLabel: t('Namespaces'),
      noItemsFoundTitle: t('No namespaces found'),
      selectPlaceholder: t('Select namespace...'),
    }),
    [t],
  );

  const wrappedUpdateBookmarks = useMemo(
    () =>
      updateBookmarks
        ? async (newBookmarks: Record<string, boolean>): Promise<Record<string, boolean>> => {
            return await updateBookmarks(newBookmarks);
          }
        : null,
    [updateBookmarks],
  );

  return (
    <Dropdown<K8sResourceCommon>
      bookmarks={{
        bookmarks: bookmarks || {},
        bookmarksLoaded,
        updateBookmarks: wrappedUpdateBookmarks,
      }}
      config={config}
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      extractKey={(ns) => getName(ns)}
      extractTitle={(ns) => getName(ns)}
      includeAllItems={includeAllNamespaces}
      items={namespaces || null}
      itemsLoaded={namespacesLoaded}
      onChange={onChange}
      selectedItem={selectedNamespace}
    />
  );
};

export default NamespaceDropdown;
