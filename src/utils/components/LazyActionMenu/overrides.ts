import {
  AccessReviewResourceAttributes,
  K8sVerb,
  checkAccess as localCheckAccess,
  useAccessReview as useLocalAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import {
  FleetAccessReviewResourceAttributes,
  useFleetAccessReview,
} from '@stolostron/multicluster-sdk';
import { checkAccess as fleetCheckAccess } from '@stolostron/multicluster-sdk/lib/internal/checkAccess';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

export const checkAccess = (
  isMulticluster: boolean,
  accessReview: AccessReviewResourceAttributes | FleetAccessReviewResourceAttributes,
  impersonate: ImpersonateKind,
) => {
  const {
    cluster = '',
    group = '',
    name = '',
    namespace = '',
    resource = '',
    subresource = '',
    verb = '' as K8sVerb,
  } = accessReview as FleetAccessReviewResourceAttributes;
  return isMulticluster
    ? fleetCheckAccess(group, resource, subresource, verb, name, namespace, cluster)
    : localCheckAccess(accessReview, impersonate);
};

export const useAccessReview = (
  isMulticluster: boolean,
  accessReview: AccessReviewResourceAttributes | FleetAccessReviewResourceAttributes,
  impersonate: ImpersonateKind,
) => {
  const [isFleetAllowed] = useFleetAccessReview(isMulticluster ? accessReview || {} : {});
  const [isLocalAllowed] = useLocalAccessReview(
    isMulticluster ? {} : accessReview || {},
    impersonate,
    true,
  );
  return isMulticluster ? isFleetAllowed : isLocalAllowed;
};

export const createLocalMenuOptions = (actions: ActionDropdownItemType[]) =>
  actions.map(({ options, ...action }) => ({
    ...action,
    children: options,
    submenu: options?.length,
  }));
