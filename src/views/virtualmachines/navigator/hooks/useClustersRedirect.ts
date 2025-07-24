import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';
import { getACMVMListNamespacesURL, getACMVMListURL, isACMPath } from '@multicluster/urls';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

const useClustersRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [clusters] = useAllClusters();
  const [hubClusterName, hubClusterNameLoaded] = useHubClusterName();

  const namespace = useNamespaceParam();

  useEffect(() => {
    if (hubClusterNameLoaded && !isEmpty(clusters) && !isACMPath(location.pathname)) {
      navigate(
        namespace ? getACMVMListNamespacesURL(hubClusterName, namespace) : getACMVMListURL(),
      );
    }
  }, [location.pathname, clusters, navigate, namespace, hubClusterName, hubClusterNameLoaded]);
};

export default useClustersRedirect;
