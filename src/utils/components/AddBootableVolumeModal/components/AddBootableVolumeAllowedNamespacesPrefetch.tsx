import { type FC, useMemo } from 'react';

import useAllowedNamespaces from '@kubevirt-utils/hooks/useAllowedNamespaces/useAllowedNamespaces';
import { getCloneSourceFleetAccessReview } from '@kubevirt-utils/resources/cdi/pvcClonePermission';

type AddBootableVolumeAllowedNamespacesPrefetchProps = {
  cluster?: string;
  isOpen: boolean;
};

const AddBootableVolumeAllowedNamespacesPrefetch: FC<
  AddBootableVolumeAllowedNamespacesPrefetchProps
> = ({ cluster, isOpen }) => {
  const cloneSourceAccessReview = useMemo(
    () => (isOpen ? getCloneSourceFleetAccessReview(cluster) : null),
    [cluster, isOpen],
  );

  useAllowedNamespaces(cloneSourceAccessReview);

  return null;
};

export default AddBootableVolumeAllowedNamespacesPrefetch;
