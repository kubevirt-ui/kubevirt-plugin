import { useMemo } from 'react';

import { useToast } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';

type ToastOptions = Parameters<ReturnType<typeof useToast>['addToast']>[0];
type HelperOptions = Omit<ToastOptions, 'content' | 'variant'> & {
  content?: ToastOptions['content'];
};

type AddToast = ReturnType<typeof useToast>['addToast'];
type RemoveToast = ReturnType<typeof useToast>['removeToast'];
type ToastHelper = (opts: HelperOptions) => ReturnType<AddToast>;

export type ToastActions = {
  addDangerToast: ToastHelper;
  addInfoToast: ToastHelper;
  addSuccessToast: ToastHelper;
  addWarningToast: ToastHelper;
  removeToast: RemoveToast;
};

type UseKubevirtToastResult = ToastActions & {
  addToast: AddToast;
};

const noopAddToast = () => 'noop';
const noopRemoveToast = () => undefined;
const noopResult = { addToast: noopAddToast, removeToast: noopRemoveToast };

const VARIANT_DEFAULTS: Record<string, Partial<ToastOptions>> = {
  [AlertVariant.danger]: { dismissible: true, timeout: false },
  [AlertVariant.info]: { dismissible: true, timeout: true },
  [AlertVariant.success]: { dismissible: true, timeout: true },
  [AlertVariant.warning]: { dismissible: true, timeout: false },
};

const useKubevirtToast = (): UseKubevirtToastResult => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- safe: useToast is unavailable in 4.22 and older console versions
  const { addToast, removeToast } = typeof useToast === 'function' ? useToast() : noopResult;

  return useMemo(() => {
    const createHelper = (variant: AlertVariant): ToastHelper => {
      return ({ content, ...rest }: HelperOptions) =>
        addToast({ ...VARIANT_DEFAULTS[variant], ...rest, content, variant });
    };

    return {
      addDangerToast: createHelper(AlertVariant.danger),
      addInfoToast: createHelper(AlertVariant.info),
      addSuccessToast: createHelper(AlertVariant.success),
      addToast,
      addWarningToast: createHelper(AlertVariant.warning),
      removeToast,
    };
  }, [addToast, removeToast]);
};

export default useKubevirtToast;
