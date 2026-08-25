import { useLocation } from 'react-router';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useActiveNamespace as useActiveNamespaceSDK } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { SELECTED_CLUSTER } from '../utils/constants';
import { getClusterInitialValue } from './utils/utils';

type WizardLocationState = {
  cluster?: string;
  namespace?: string;
};

type WizardInitialValues = {
  cluster: string;
  hubClusterError: any;
  isLoadingHubCluster: boolean;
  namespace: string;
};

const useWizardInitialValues = (): WizardInitialValues => {
  const location = useLocation();
  const { state } = location as { state: null | WizardLocationState };
  const activeNamespaceFromUtil = useActiveNamespace();
  const [activeNamespaceFromSDK] = useActiveNamespaceSDK();
  const [hubClusterName, hubClusterLoaded, hubClusterError] = useHubClusterName();

  const isACM = useIsACMPage();

  const activeNamespace = isACM ? activeNamespaceFromUtil : activeNamespaceFromSDK;
  const namespace = getValidNamespace(state?.namespace ?? activeNamespace);

  const [clusterFromLocalStorage] = useLocalStorage(SELECTED_CLUSTER.LOCAL_STORAGE_KEY);

  const cluster = getClusterInitialValue({
    clusterFromLocalStorage,
    clusterFromNavigate: state?.cluster,
    hubClusterName,
    isACM,
  });

  return {
    cluster,
    hubClusterError: isACM ? hubClusterError : undefined,
    isLoadingHubCluster: isACM && !hubClusterLoaded,
    namespace,
  };
};

export default useWizardInitialValues;
