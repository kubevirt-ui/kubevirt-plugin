import { useEffect } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import useBootableVolumes from './hooks/useBootableVolumes';
import useInstanceTypesAndPreferences from './hooks/useInstanceTypesAndPreferences';
import { useInstanceTypeVMInitialStore } from './hooks/useInstanceTypeVMInitialStore';

export const useInstanceTypeVMStore = () => {
  const store = useInstanceTypeVMInitialStore();

  const bootableVolumesData = useBootableVolumes();
  const instanceTypesAndPreferencesData = useInstanceTypesAndPreferences();
  const [activeNamespace] = useActiveNamespace();

  useEffect(() => {
    if (!isEqualObject(store.bootableVolumesData, bootableVolumesData)) {
      store.setBootableVolumesData(bootableVolumesData);
    }
  }, [bootableVolumesData, store]);

  useEffect(() => {
    if (!isEqualObject(store.instanceTypesAndPreferencesData, instanceTypesAndPreferencesData)) {
      store.setInstanceTypesAndPreferencesData(instanceTypesAndPreferencesData);
    }
  }, [instanceTypesAndPreferencesData, store]);

  useEffect(() => {
    if (!isEqualObject(store.activeNamespace, activeNamespace)) {
      store.setActiveNamespace(activeNamespace);
      store.setVMNamespaceTarget(
        activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace,
      );
    }
  }, [activeNamespace, bootableVolumesData, store]);

  return store;
};
