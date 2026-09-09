import { useMemo } from 'react';

import { useToast } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import { getToastVariantDefaults } from './constants';
import {
  type AddToast,
  type RemoveToast,
  type ToastHelper,
  type UseKubevirtToastResult,
} from './types';

const noopAddToast: AddToast = () => 'noop';
const noopRemoveToast: RemoveToast = () => undefined;

const useKubevirtToast = (): UseKubevirtToastResult => {
  const { t } = useKubevirtTranslation();
  const toast = useToast();
  const addToast = toast?.addToast ?? noopAddToast;
  const removeToast = toast?.removeToast ?? noopRemoveToast;

  return useMemo(() => {
    const variantDefaults = getToastVariantDefaults(t);
    const createHelper = (variant: AlertVariant): ToastHelper => {
      return ({ content, ...rest }) =>
        addToast({ ...variantDefaults[variant], ...rest, content, variant });
    };

    return {
      addDangerToast: createHelper(AlertVariant.danger),
      addInfoToast: createHelper(AlertVariant.info),
      addSuccessToast: createHelper(AlertVariant.success),
      addToast,
      addWarningToast: createHelper(AlertVariant.warning),
      removeToast,
    };
  }, [addToast, removeToast, t]);
};

export default useKubevirtToast;
