import { type TFunction } from 'i18next';

import { type WatchedToastData } from '@kubevirt-utils/signals/toastRequestResultSignal';
import { getErrorMessage, isEmpty } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';

import { type ToastHelper, type ToastOptions, type UseKubevirtToastResult } from '../types';

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

const FAILED_PHASES = new Set(['Error', 'Failed', 'Unknown']);
const SUCCEEDED_PHASE = 'Succeeded';

type WatchedResourceStatus = {
  conditions?: Array<{ message?: string; status?: string; type?: string }>;
  phase?: string;
};

type WatchedResource = K8sResourceCommon & { status?: WatchedResourceStatus };

const isResourceReadySuccess = (status?: WatchedResourceStatus): boolean =>
  status?.conditions?.some(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  ) ?? false;

const getResourceFailureMessage = (status?: WatchedResourceStatus): string | undefined => {
  const phase = status?.phase;
  if (!phase || !FAILED_PHASES.has(phase)) {
    return undefined;
  }

  return status?.conditions?.find((condition) => condition.status === 'False')?.message ?? phase;
};

const getToastOptionsByResourceStatus = (
  resource: WatchedResource | undefined,
  watchedToast: WatchedToastData,
): ToastOptions | undefined => {
  if (isEmpty(resource)) {
    return;
  }

  const baseOptions = {
    ...watchedToast.toastOptions,
    content: watchedToast.toastOptions?.content ?? '',
    title: watchedToast.toastOptions?.title ?? '',
  };

  const status = resource?.status;
  const statusPhase = status?.phase;

  if (statusPhase && FAILED_PHASES.has(statusPhase)) {
    return {
      ...baseOptions,
      content: getErrorMessage(getResourceFailureMessage(status)),
      variant: AlertVariant.danger,
    };
  }

  if (statusPhase === SUCCEEDED_PHASE || isResourceReadySuccess(status)) {
    return {
      ...baseOptions,
      variant: AlertVariant.success,
    };
  }

  return;
};

export const getToastOptionsToDisplay = (
  resource: K8sResourceCommon | undefined,
  watchedToast: WatchedToastData,
  t: TFunction,
  watchError?: Error,
): ToastOptions | undefined => {
  const title = watchedToast.toastOptions?.title ?? '';

  if (watchError) {
    return {
      ...watchedToast.toastOptions,
      content: watchedToast.toastOptions?.content ?? t(getErrorMessage(watchError)),
      title,
      variant: AlertVariant.danger,
    };
  }

  return getToastOptionsByResourceStatus(resource, watchedToast);
};
