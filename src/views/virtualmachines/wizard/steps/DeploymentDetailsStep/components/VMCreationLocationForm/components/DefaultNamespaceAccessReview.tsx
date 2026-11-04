import { type FC, useEffect } from 'react';

import useCanCreateVMInDefaultNamespace from '@virtualmachines/wizard/hooks/useCanCreateVMInDefaultNamespace';

type DefaultNamespaceAccessReviewProps = {
  cluster: string;
  onSettled: (canCreate: boolean) => void;
};

const DefaultNamespaceAccessReview: FC<DefaultNamespaceAccessReviewProps> = ({
  cluster,
  onSettled,
}) => {
  const { canCreate, loading } = useCanCreateVMInDefaultNamespace({
    cluster,
    enabled: true,
  });

  useEffect(() => {
    if (loading) {
      return;
    }

    onSettled(canCreate);
  }, [canCreate, loading, onSettled]);

  return null;
};

export default DefaultNamespaceAccessReview;
