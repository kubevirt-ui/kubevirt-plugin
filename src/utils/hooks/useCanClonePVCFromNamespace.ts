import { useEffect, useMemo, useState } from 'react';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { checkAccessForFleet } from '@kubevirt-utils/components/LazyActionMenu/overrides';
import { ensurePVCCloneRoleBinding } from '@kubevirt-utils/resources/cdi/ensurePVCCloneRoleBinding';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  type AccessReviewResourceAttributes,
  checkAccess,
  type SelfSubjectAccessReviewKind,
} from '@openshift-console/dynamic-plugin-sdk';

type UseCanClonePVCFromNamespaceResult = {
  canClone: boolean;
  isChecking: boolean;
  requiresClonePermission: boolean;
};

const isAccessAllowed = (result: SelfSubjectAccessReviewKind): boolean =>
  Boolean(result?.status?.allowed);

const useCanClonePVCFromNamespace = (
  sourceNamespace?: string,
  destinationNamespace?: string,
  cluster?: string,
): UseCanClonePVCFromNamespaceResult => {
  const isACMPage = useIsACMPage();

  const requiresClonePermission = Boolean(
    sourceNamespace && destinationNamespace && sourceNamespace !== destinationNamespace,
  );

  const dataVolumeSourceAccessReview = useMemo((): AccessReviewResourceAttributes | null => {
    if (!requiresClonePermission || !sourceNamespace) {
      return null;
    }

    return {
      ...(cluster ? { cluster } : {}),
      group: DataVolumeModel.apiGroup,
      namespace: sourceNamespace,
      resource: DataVolumeModel.plural,
      subresource: 'source',
      verb: 'create',
    };
  }, [cluster, requiresClonePermission, sourceNamespace]);

  const [isChecking, setIsChecking] = useState(false);
  const [canClone, setCanClone] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkClonePermission = async (): Promise<void> => {
      if (!requiresClonePermission || !dataVolumeSourceAccessReview || !sourceNamespace) {
        setCanClone(true);
        setIsChecking(false);
        return;
      }

      const checkAccessDelegate = cluster && isACMPage ? checkAccessForFleet : checkAccess;

      setIsChecking(true);

      try {
        const initialResult = (await checkAccessDelegate(
          dataVolumeSourceAccessReview,
        )) as SelfSubjectAccessReviewKind;

        if (cancelled) {
          return;
        }

        if (isAccessAllowed(initialResult)) {
          setCanClone(true);
          return;
        }

        const roleBindingEnsured = await ensurePVCCloneRoleBinding(
          sourceNamespace,
          cluster,
          isACMPage,
        );

        if (cancelled) {
          return;
        }

        if (!roleBindingEnsured) {
          setCanClone(false);
          return;
        }

        const recheckResult = (await checkAccessDelegate(
          dataVolumeSourceAccessReview,
        )) as SelfSubjectAccessReviewKind;

        if (!cancelled) {
          setCanClone(isAccessAllowed(recheckResult));
        }
      } catch (error) {
        kubevirtConsole.warn('PVC clone access review failed', error);
        if (!cancelled) {
          setCanClone(true);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    void checkClonePermission();

    return (): void => {
      cancelled = true;
    };
  }, [cluster, dataVolumeSourceAccessReview, isACMPage, requiresClonePermission, sourceNamespace]);

  return { canClone, isChecking, requiresClonePermission };
};

export default useCanClonePVCFromNamespace;
