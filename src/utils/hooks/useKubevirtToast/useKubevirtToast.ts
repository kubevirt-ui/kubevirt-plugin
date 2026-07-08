import { useMemo } from 'react';

import { useToast } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';

import { useKubevirtTranslation } from '../useKubevirtTranslation';

import { getToastVariantDefaults } from './constants';
import { ToastHelper, UseKubevirtToastResult } from './types';

const noopAddToast = () => 'noop';
const noopRemoveToast = () => undefined;
const noopResult = { addToast: noopAddToast, removeToast: noopRemoveToast };

const useKubevirtToast = (): UseKubevirtToastResult => {
  const { t } = useKubevirtTranslation();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- safe: useToast is unavailable in 4.22 and older console versions
  const { addToast, removeToast } = typeof useToast === 'function' ? useToast() : noopResult;

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
