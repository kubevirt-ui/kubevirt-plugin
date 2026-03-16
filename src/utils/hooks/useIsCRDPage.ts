import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { CustomResourceDefinitionModel } from '@kubevirt-utils/models';

const useIsCRDPage = () => {
  const location = useLocation();

  return useMemo(
    () => location?.pathname?.startsWith(`/k8s/cluster/${CustomResourceDefinitionModel.plural}`),
    [location],
  );
};

export default useIsCRDPage;
