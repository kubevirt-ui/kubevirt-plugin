import { useToast } from '@openshift-console/dynamic-plugin-sdk';

export type ToastOptions = Parameters<ReturnType<typeof useToast>['addToast']>[0];
export type HelperOptions = Omit<ToastOptions, 'content' | 'variant'> & {
  content?: ToastOptions['content'];
};

export type AddToast = ReturnType<typeof useToast>['addToast'];
export type RemoveToast = ReturnType<typeof useToast>['removeToast'];
export type ToastHelper = (opts: HelperOptions) => ReturnType<AddToast>;

export type ToastActions = {
  addDangerToast: ToastHelper;
  addInfoToast: ToastHelper;
  addSuccessToast: ToastHelper;
  addWarningToast: ToastHelper;
  removeToast: RemoveToast;
};

export type UseKubevirtToastResult = ToastActions & {
  addToast: AddToast;
};
