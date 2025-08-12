import { useMemo } from 'react';
import produce from 'immer';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useProviderByClusterName from '@multicluster/components/CrossClusterMigration/hooks/useProviderByClusterName';
import { CROSS_CLUSTER_MIGRATION_ACTION_ID } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { ACMVirtualMachineActionExtension } from './constants';
import {
  buildACMVirtualMachineActionsFromExtensions,
  isACMVirtualMachineActionExtension,
} from './utils';

const useACMExtensionActions = (vm): ActionDropdownItemType[] => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const [provider, providerLoaded] = useProviderByClusterName(getCluster(vm) ?? hubClusterName);

  const [virtualMachineActionExtensions, virtualMachineActionExtensionsResolved] =
    useResolvedExtensions<ACMVirtualMachineActionExtension>(isACMVirtualMachineActionExtension);

  return useMemo(() => {
    if (!isACMPage || !virtualMachineActionExtensionsResolved) return [];

    const actions = produce(virtualMachineActionExtensions, (draft) => {
      const crossClusterMigration = draft.find(
        (action) => action.properties.id === CROSS_CLUSTER_MIGRATION_ACTION_ID,
      );
      if (providerLoaded && isEmpty(provider)) {
        crossClusterMigration.properties.isDisabled = true;
        crossClusterMigration.properties.description = t(
          'Cross-cluster migration is not supported on this cluster.',
        );
      }
    });

    return buildACMVirtualMachineActionsFromExtensions(vm, actions, createModal, hubClusterName);
  }, [
    isACMPage,
    virtualMachineActionExtensionsResolved,
    virtualMachineActionExtensions,
    vm,
    createModal,
    hubClusterName,
    providerLoaded,
    provider,
    t,
  ]);
};

export default useACMExtensionActions;
