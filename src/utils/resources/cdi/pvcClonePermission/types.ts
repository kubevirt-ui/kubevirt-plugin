import {
  type AccessReviewResourceAttributes,
  type SelfSubjectAccessReviewKind,
} from '@openshift-console/dynamic-plugin-sdk';

export type CheckAccessDelegate = (
  resourceAttributes: AccessReviewResourceAttributes,
) => Promise<SelfSubjectAccessReviewKind>;

export type PVCClonePermissionParams = {
  cluster?: string;
  destinationNamespace?: string;
  isACMPage: boolean;
  sourceNamespace?: string;
};

export type PVCClonePermissionResult = {
  canClone: boolean;
  requiresClonePermission: boolean;
};
