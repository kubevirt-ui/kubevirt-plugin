import { useEffect, useState } from 'react';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  AccessReviewResourceAttributes,
  Action,
  checkAccess,
  GroupedMenuOption,
  K8sVerb,
  MenuOption,
  SelfSubjectAccessReviewKind,
} from '@openshift-console/dynamic-plugin-sdk';
import { ImpersonateKind } from '@openshift-console/dynamic-plugin-sdk/lib/app/redux-types';
import { FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';
import { checkAccess as fleetCheckAccess } from '@stolostron/multicluster-sdk/lib/internal/checkAccess';

import { ActionDropdownItemType } from '../ActionsDropdown/constants';

import { CheckAccess } from './LazyActionMenu';

export const checkAccessForFleet = (
  accessReview: AccessReviewResourceAttributes | FleetAccessReviewResourceAttributes,
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
  return fleetCheckAccess(group, resource, subresource, verb, name, namespace, cluster);
};

/**
 * Hook that wraps checkAccess() and handles waiting/loading state.
 * Note that the loading state will be displayed only during first call to checkAccess().
 * Subsequent calls will update the `isAllowed` flag but not the `loading` state.
 * The provided checkAccess() implementation should be memoized.
 * 
 * @param resourceAttributes resource attributes for access review
 * @param impersonate impersonation details
 * @param checkAccessDelegate defaults to built-in checkAccess() implementation
 * @returns Array with `isAllowed` and `loading` values.
 
 */
export const useCheckAccess = (
  resourceAttributes: AccessReviewResourceAttributes,
  impersonate?: ImpersonateKind,
  checkAccessDelegate: CheckAccess = checkAccess,
): [boolean, boolean] => {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setAllowed] = useState(false);

  useEffect(() => {
    checkAccessDelegate(resourceAttributes, impersonate)
      .then((result: SelfSubjectAccessReviewKind) => {
        setAllowed(Boolean(result?.status?.allowed));
      })
      .catch((e) => {
        kubevirtConsole.warn('SelfSubjectAccessReview failed', e);
        // Default to enabling the action if the access review fails so that we
        // don't incorrectly block users from actions they can perform. The server
        // still enforces access control.
        setAllowed(true);
      })
      .finally(() => setLoading(false));
  }, [resourceAttributes, impersonate, checkAccessDelegate]);
  return [isAllowed, loading];
};

export const createLocalMenuOptions = (actions: ActionDropdownItemType[]): MenuOption[] =>
  actions?.map((action) =>
    action.options?.length > 0
      ? {
          ...action,
          children: createLocalMenuOptions(action.options),
          // action groups should have no attached direct actions
          cta: undefined,
          // default to submenus
          submenu: true,
        }
      : action,
  ) ?? [];

/**
 * Merge duplicated options that exist on the same level.
 * For actions - take the first defined.
 * For groups - take the props from the first, merge the children.
 * @param options list of options (with duplicates on the same level)
 * @returns merged, de-duplicated list (on the same level)
 */
export const mergeOptions = (options: MenuOption[]): MenuOption[] =>
  // use array based dictionary to guarantee the order
  // first encountered is first in the results
  options
    .reduce((acc, opt) => {
      const existingIndex = acc.findIndex(({ id }) => id === opt.id);
      if (existingIndex === -1) {
        acc.push({ duplicates: [opt], id: opt.id });
      } else {
        acc[existingIndex].duplicates.push(opt);
      }
      return acc;
    }, [] as { duplicates: MenuOption[]; id: string }[])
    .map(
      ({ duplicates }): MenuOption => ({
        // grouping is stable, take the props from the first defined option
        ...duplicates[0],
        ...(isAction(duplicates[0])
          ? {}
          : {
              children: mergeOptions(
                duplicates.flatMap((opt) => (opt as GroupedMenuOption)?.children ?? []),
              ),
            }),
      }),
    );

export const isAction = (obj: unknown): obj is Action => !!(obj as Action).cta;

/**
 * Traverse the option tree to retrieve accessReview properties.
 * Order of results is not guaranteed.
 *
 * @param options tree of options
 * @returns flat list of accessReview properties
 */
export const flattenToAccessReview = (options: MenuOption[]): AccessReviewResourceAttributes[] =>
  options
    .flatMap((opt) =>
      isAction(opt) ? [opt.accessReview] : flattenToAccessReview(opt.children ?? []),
    )
    .filter(Boolean);
