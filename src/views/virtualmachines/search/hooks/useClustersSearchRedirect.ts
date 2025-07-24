import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import useAllClusters from '@multicluster/hooks/useAllClusters/useAllClusters';
import useVMSearchURL from '@multicluster/hooks/useVMSearchURL';
import { isACMPath } from '@multicluster/urls';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

const useClustersSearchRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [clusters] = useAllClusters();
  const [hubClusterName, hubClusterNameLoaded] = useHubClusterName();

  const vmSearchURL = useVMSearchURL();

  useEffect(() => {
    if (hubClusterNameLoaded && !isEmpty(clusters) && !isACMPath(location.pathname)) {
      navigate(vmSearchURL);
    }
  }, [location.pathname, clusters, navigate, hubClusterName, hubClusterNameLoaded, vmSearchURL]);
};

export default useClustersSearchRedirect;
