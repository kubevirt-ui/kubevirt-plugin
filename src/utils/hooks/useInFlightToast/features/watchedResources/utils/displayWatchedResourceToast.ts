import { getWatchedResourcesActions } from '@kubevirt-utils/hooks/useInFlightToast/shared/selectors/inFlightToastStoreSelectors';
import { AlertVariant } from '@patternfly/react-core';

import {
  type ToastHelper,
  type ToastOptions,
  type UseKubevirtToastResult,
} from '../../../../useKubevirtToast/types';

export const getToastMapperByVariant = ({
  addDangerToast,
  addInfoToast,
  addSuccessToast,
  addWarningToast,
}: Omit<UseKubevirtToastResult, 'addToast' | 'removeToast'>): Partial<
  Record<AlertVariant, ToastHelper>
> => ({
  [AlertVariant.danger]: addDangerToast,
  [AlertVariant.info]: addInfoToast,
  [AlertVariant.success]: addSuccessToast,
  [AlertVariant.warning]: addWarningToast,
});

export const syncWatchedResourceToast = (
  toastOptions: ToastOptions,
  toastActions: Omit<UseKubevirtToastResult, 'addToast'>,
  toastId: string,
): void => {
  const toastByVariant = getToastMapperByVariant(toastActions);
  const displayToast = toastByVariant[toastOptions.variant];

  displayToast?.({
    ...toastOptions,
    id: toastId,
    onRemove: () => getWatchedResourcesActions().removeWatchedResource(toastId),
  });

  getWatchedResourcesActions().removeWatchedResource(toastId);
};
