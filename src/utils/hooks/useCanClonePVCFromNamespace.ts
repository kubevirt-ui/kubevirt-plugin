import { useEffect, useState } from 'react';

import {
  requiresCrossNamespaceClone,
  resolvePVCClonePermission,
} from '@kubevirt-utils/resources/cdi/pvcClonePermission';
import useIsACMPage from '@multicluster/useIsACMPage';

type UseCanClonePVCFromNamespaceResult = {
  canClone: boolean;
  isChecking: boolean;
  requiresClonePermission: boolean;
};

const useCanClonePVCFromNamespace = (
  sourceNamespace?: string,
  destinationNamespace?: string,
  cluster?: string,
): UseCanClonePVCFromNamespaceResult => {
  const isACMPage = useIsACMPage();
  const requiresClonePermission = requiresCrossNamespaceClone(
    sourceNamespace,
    destinationNamespace,
  );

  const [isChecking, setIsChecking] = useState(false);
  const [canClone, setCanClone] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const runPermissionCheck = async (): Promise<void> => {
      if (!requiresClonePermission || !sourceNamespace) {
        setCanClone(true);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);

      const result = await resolvePVCClonePermission({
        cluster,
        destinationNamespace,
        isACMPage,
        sourceNamespace,
      });

      if (cancelled) {
        return;
      }

      setCanClone(result.canClone);
      setIsChecking(false);
    };

    void runPermissionCheck();

    return (): void => {
      cancelled = true;
    };
  }, [cluster, destinationNamespace, isACMPage, requiresClonePermission, sourceNamespace]);

  return { canClone, isChecking, requiresClonePermission };
};

export default useCanClonePVCFromNamespace;
