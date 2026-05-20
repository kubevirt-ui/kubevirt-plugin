import { useCallback } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useToast } from '@openshift-console/dynamic-plugin-sdk';
import { AlertVariant } from '@patternfly/react-core';

const useAddCreateFromVMToast = () => {
  const { t } = useKubevirtTranslation();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- safe: useToast is unavailable in 4.22 and older console versions
  const { addToast } = typeof useToast === 'function' ? useToast() : { addToast: () => undefined };

  const addCreateFromVMToast = useCallback(() => {
    addToast({
      content: undefined,
      dismissible: true,
      timeout: true,
      title: t(
        'To create a template from a VM, select a VM and choose Save as template from the Actions menu.',
      ),
      variant: AlertVariant.info,
    });
  }, [addToast, t]);

  return addCreateFromVMToast;
};

export default useAddCreateFromVMToast;
