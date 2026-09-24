import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import {
  buildCloneSourceAccessReview,
  checkCloneSourceAccess,
  getCheckAccessDelegate,
  requiresCrossNamespaceClone,
} from './accessReview';
import { type PVCClonePermissionParams, type PVCClonePermissionResult } from './types';

export const resolvePVCClonePermission = async ({
  cluster,
  destinationNamespace,
  isACMPage,
  sourceNamespace,
}: PVCClonePermissionParams): Promise<PVCClonePermissionResult> => {
  const requiresClonePermission = requiresCrossNamespaceClone(
    sourceNamespace,
    destinationNamespace,
  );

  if (!requiresClonePermission || !sourceNamespace) {
    return { canClone: true, requiresClonePermission };
  }

  const checkAccessDelegate = getCheckAccessDelegate(cluster, isACMPage);
  const cloneSourceAccessReview = buildCloneSourceAccessReview(sourceNamespace, cluster);

  try {
    const canClone = await checkCloneSourceAccess(checkAccessDelegate, cloneSourceAccessReview);
    return { canClone, requiresClonePermission };
  } catch (error) {
    kubevirtConsole.warn('PVC clone permission check failed', error);
    return { canClone: true, requiresClonePermission };
  }
};
