import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { checkAccessForFleet } from '@kubevirt-utils/components/LazyActionMenu/overrides';
import {
  type AccessReviewResourceAttributes,
  checkAccess,
  type SelfSubjectAccessReviewKind,
} from '@openshift-console/dynamic-plugin-sdk';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import { type CheckAccessDelegate } from './types';

export const requiresCrossNamespaceClone = (
  sourceNamespace?: string,
  destinationNamespace?: string,
): boolean =>
  Boolean(sourceNamespace && destinationNamespace && sourceNamespace !== destinationNamespace);

export const getCheckAccessDelegate = (
  cluster?: string,
  isACMPage?: boolean,
): CheckAccessDelegate => (cluster && isACMPage ? checkAccessForFleet : checkAccess);

const cloneSourceFleetAccessReviewAttributes = {
  group: DataVolumeModel.apiGroup,
  resource: DataVolumeModel.plural,
  subresource: 'source',
  verb: 'create',
} satisfies Omit<FleetAccessReviewResourceAttributes, 'cluster'>;

export const getCloneSourceFleetAccessReview = (
  cluster?: string,
): FleetAccessReviewResourceAttributes => ({
  ...cloneSourceFleetAccessReviewAttributes,
  cluster,
});

export const buildCloneSourceAccessReview = (
  sourceNamespace: string,
  cluster?: string,
): AccessReviewResourceAttributes => ({
  ...(cluster ? { cluster } : {}),
  group: DataVolumeModel.apiGroup,
  namespace: sourceNamespace,
  resource: DataVolumeModel.plural,
  subresource: 'source',
  verb: 'create',
});

export const isAccessAllowed = (result: SelfSubjectAccessReviewKind): boolean =>
  Boolean(result?.status?.allowed);

export const checkCloneSourceAccess = async (
  checkAccessDelegate: CheckAccessDelegate,
  accessReview: AccessReviewResourceAttributes,
): Promise<boolean> => isAccessAllowed(await checkAccessDelegate(accessReview));
