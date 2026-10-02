import { useEffect, useRef, useState } from 'react';

import { requiresCrossNamespaceClone } from '@kubevirt-utils/resources/cdi/pvcClonePermission';
import useIsACMPage from '@multicluster/useIsACMPage';

import { loadClonePermission } from './utils';

type ResolvedClonePermission = {
  canClone: boolean;
  requestId: number;
};

type UseCanClonePVCFromNamespaceResult = {
  blocksCloneAction: boolean;
  requiresClonePermission: boolean;
  showClonePermissionError: boolean;
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
  const requestIdRef = useRef(0);
  const [activeRequestId, setActiveRequestId] = useState(0);
  const [resolvedPermission, setResolvedPermission] = useState<ResolvedClonePermission | null>(
    null,
  );

  useEffect(() => {
    if (!requiresClonePermission || !sourceNamespace) {
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setActiveRequestId(requestId);

    let cancelled = false;

    const runPermissionCheck = async (): Promise<void> => {
      const result = await loadClonePermission({
        cluster,
        destinationNamespace,
        isACMPage,
        sourceNamespace,
      });

      if (cancelled || requestId !== requestIdRef.current) {
        return;
      }

      setResolvedPermission({ canClone: result.canClone, requestId });
    };

    void runPermissionCheck();

    return (): void => {
      cancelled = true;
    };
  }, [cluster, destinationNamespace, isACMPage, requiresClonePermission, sourceNamespace]);

  const isCurrentResult = resolvedPermission?.requestId === activeRequestId;
  const isChecking = requiresClonePermission && Boolean(sourceNamespace) && !isCurrentResult;
  const canClone = requiresClonePermission
    ? Boolean(isCurrentResult && resolvedPermission?.canClone)
    : true;
  const hasSourceNamespace = Boolean(sourceNamespace);
  const blocksCloneAction =
    requiresClonePermission && hasSourceNamespace && (isChecking || !canClone);
  const showClonePermissionError =
    requiresClonePermission && hasSourceNamespace && !isChecking && !canClone;

  return { blocksCloneAction, requiresClonePermission, showClonePermissionError };
};

export default useCanClonePVCFromNamespace;
