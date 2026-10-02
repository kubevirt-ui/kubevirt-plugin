import {
  type ClonePermissionRequest,
  type PVCClonePermissionResult,
  resolvePVCClonePermission,
} from '@kubevirt-utils/resources/cdi/pvcClonePermission';

// Reuse one in-flight access review when multiple hook callers share the same selection.
const inFlightClonePermissionChecks = new Map<string, Promise<PVCClonePermissionResult>>();

export const clonePermissionKey = ({
  cluster,
  destinationNamespace,
  isACMPage,
  sourceNamespace,
}: ClonePermissionRequest): string =>
  `${sourceNamespace}|${destinationNamespace ?? ''}|${cluster ?? ''}|${String(isACMPage)}`;

export const loadClonePermission = (
  request: ClonePermissionRequest,
): Promise<PVCClonePermissionResult> => {
  const key = clonePermissionKey(request);
  const pending = inFlightClonePermissionChecks.get(key);
  if (pending) {
    return pending;
  }

  const permissionCheck = resolvePVCClonePermission(request).finally(() => {
    inFlightClonePermissionChecks.delete(key);
  });
  inFlightClonePermissionChecks.set(key, permissionCheck);
  return permissionCheck;
};
