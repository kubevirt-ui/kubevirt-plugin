import { useCallback } from 'react';

import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const useAddCreateFromVMToast = (): (() => string) => {
  const { t } = useKubevirtTranslation();
  const { addInfoToast } = useKubevirtToast();

  const addCreateFromVMToast = useCallback(
    () =>
      addInfoToast({
        title: t(
          'To create a template from a VM, select a VM and choose "Save as template" from the Actions menu.',
        ),
      }),
    [addInfoToast, t],
  );

  return addCreateFromVMToast;
};

export default useAddCreateFromVMToast;
