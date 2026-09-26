import { useEffect, useMemo, useState } from 'react';

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

type ResolvedClonePermission = {
  canClone: boolean;
  key: string;
};

const buildPermissionKey = (
  sourceNamespace: string,
  destinationNamespace?: string,
  cluster?: string,
): string => `${sourceNamespace}|${destinationNamespace ?? ''}|${cluster ?? ''}`;

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

  const permissionKey = useMemo(() => {
    if (!requiresClonePermission || !sourceNamespace) {
      return null;
    }

    return buildPermissionKey(sourceNamespace, destinationNamespace, cluster);
  }, [cluster, destinationNamespace, requiresClonePermission, sourceNamespace]);

  const [resolvedPermission, setResolvedPermission] = useState<ResolvedClonePermission | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const runPermissionCheck = async (): Promise<void> => {
      if (!permissionKey || !sourceNamespace) {
        return;
      }

      const result = await resolvePVCClonePermission({
        cluster,
        destinationNamespace,
        isACMPage,
        sourceNamespace,
      });

      if (cancelled) {
        return;
      }

      setResolvedPermission({ canClone: result.canClone, key: permissionKey });
    };

    void runPermissionCheck();

    return (): void => {
      cancelled = true;
    };
  }, [cluster, destinationNamespace, isACMPage, permissionKey, sourceNamespace]);

  const isResolvedForCurrentSelection =
    permissionKey !== null && resolvedPermission?.key === permissionKey;
  const isChecking = Boolean(permissionKey) && !isResolvedForCurrentSelection;

  let canClone = true;
  if (requiresClonePermission) {
    canClone = isResolvedForCurrentSelection ? resolvedPermission.canClone : false;
  }

  return { canClone, isChecking, requiresClonePermission };
};

export default useCanClonePVCFromNamespace;
