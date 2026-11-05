import { createElement } from 'react';
import { type TFunction } from 'i18next';

import {
  CLONE_VM_CANNOT_RETRIEVE_STATUS_CONTENT,
  INFO_TOAST_TIMEOUT_MS,
  WARNING_TOAST_TIMEOUT_MS,
} from '@kubevirt-utils/components/CloneVMModal/utils/constants';
import {
  type ToastOptions,
  type UseKubevirtToastResult,
} from '@kubevirt-utils/hooks/useKubevirtToast/types';
import { getErrorMessage } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';

import WatchedResourceSuccessToastContent from '../components/WatchedResourceSuccessToastContent';
import { type WatchedResourceToast } from '../types/types';

const FAILED_PHASES = new Set(['Error', 'Failed', 'Unknown']);
const SUCCEEDED_PHASE = 'Succeeded';

type WatchedResourceStatus = {
  conditions?: Array<{ message?: string; status?: string; type?: string }>;
  phase?: string;
};

type WatchedResource = K8sResourceCommon & { status?: WatchedResourceStatus };

type GetToastOptionsByResourceStatusProps = {
  navigate: (path: string) => void;
  resource: WatchedResource | undefined;
  t: TFunction;
  watchedResourceToast: WatchedResourceToast;
  watchError: unknown;
};

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

const buildDangerToastOptions = (
  watchedResourceToast: WatchedResourceToast,
  requestError: unknown,
  status: WatchedResourceStatus | undefined,
  title: string,
): ToastOptions => ({
  ...watchedResourceToast.toastOptions,
  content: getErrorMessage(requestError || getResourceFailureMessage(status)),
  title,
  variant: AlertVariant.danger,
});

const buildWarningToastOptions = (
  watchedResourceToast: WatchedResourceToast,
  navigate: (path: string) => void,
  t: TFunction,
  title: string,
): ToastOptions => ({
  ...watchedResourceToast.toastOptions,
  content: createElement(WatchedResourceSuccessToastContent, {
    content: t(CLONE_VM_CANNOT_RETRIEVE_STATUS_CONTENT),
    links: watchedResourceToast.toastOptions.successLinks ?? [],
    navigate,
  }),
  timeout: WARNING_TOAST_TIMEOUT_MS,
  title,
  variant: AlertVariant.warning,
});

const buildSuccessToastOptions = (
  watchedResourceToast: WatchedResourceToast,
  navigate: (path: string) => void,
  title: string,
): ToastOptions => ({
  ...watchedResourceToast.toastOptions,
  content: createElement(WatchedResourceSuccessToastContent, {
    content: watchedResourceToast.toastOptions.successContent,
    links: watchedResourceToast.toastOptions.successLinks ?? [],
    navigate,
  }),
  title: watchedResourceToast.toastOptions.successTitle ?? title,
  variant: AlertVariant.success,
});

export const getToastOptionsByResourceStatus = ({
  navigate,
  resource,
  t,
  watchedResourceToast,
  watchError,
}: GetToastOptionsByResourceStatusProps): ToastOptions | undefined => {
  const title = watchedResourceToast.toastOptions?.title ?? '';
  const status = resource?.status;
  const statusPhase = status?.phase;
  const requestError: unknown = watchedResourceToast.toastOptions?.error;

  if (requestError || (statusPhase && FAILED_PHASES.has(statusPhase))) {
    return buildDangerToastOptions(watchedResourceToast, requestError, status, title);
  }

  const hasWatchErrorAfterResourceLoaded = Boolean(watchError && resource);
  if (hasWatchErrorAfterResourceLoaded) {
    return buildWarningToastOptions(watchedResourceToast, navigate, t, title);
  }

  if (statusPhase === SUCCEEDED_PHASE || isResourceReadySuccess(status)) {
    return buildSuccessToastOptions(watchedResourceToast, navigate, title);
  }

  return;
};

export const showInitialToast = (
  watchedResourceToast: WatchedResourceToast,
  toastActions: UseKubevirtToastResult,
): void => {
  if (!watchedResourceToast.toastOptions.showInitialToast) {
    return;
  }

  toastActions.addInfoToast({
    ...watchedResourceToast.toastOptions,
    content: watchedResourceToast.toastOptions.content ?? '',
    dismissible: false,
    id: watchedResourceToast.id,
    timeout: INFO_TOAST_TIMEOUT_MS,
    title: watchedResourceToast.toastOptions.title ?? '',
  });
};
