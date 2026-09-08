import { useEffect, useMemo, useState } from 'react';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { checkAccessForFleet } from '@kubevirt-utils/components/LazyActionMenu/overrides';
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

  const podsAccessReview = useMemo((): AccessReviewResourceAttributes | null => {
    if (!requiresClonePermission || !sourceNamespace) {
      return null;
    }

    return {
      ...(cluster ? { cluster } : {}),
      namespace: sourceNamespace,
      resource: 'pods',
      verb: 'create',
    };
  }, [cluster, requiresClonePermission, sourceNamespace]);

  const [isChecking, setIsChecking] = useState(false);
  const [canClone, setCanClone] = useState(true);

  useEffect(() => {
    if (!requiresClonePermission || !dataVolumeSourceAccessReview || !podsAccessReview) {
      setCanClone(true);
      setIsChecking(false);
      return;
    }

    const checkAccessDelegate = cluster && isACMPage ? checkAccessForFleet : checkAccess;

    setIsChecking(true);

    Promise.all([
      checkAccessDelegate(dataVolumeSourceAccessReview),
      checkAccessDelegate(podsAccessReview),
    ])
      .then(([dataVolumeSourceResult, podsResult]) => {
        setCanClone(isAccessAllowed(dataVolumeSourceResult) || isAccessAllowed(podsResult));
      })
      .catch((error) => {
        kubevirtConsole.warn('PVC clone access review failed', error);
        setCanClone(true);
      })
      .finally(() => setIsChecking(false));
  }, [cluster, dataVolumeSourceAccessReview, isACMPage, podsAccessReview, requiresClonePermission]);

  return { canClone, isChecking, requiresClonePermission };
};

export default useCanClonePVCFromNamespace;
