import { useCallback, useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { reconcileGeneratedVM } from '@virtualmachines/wizard/utils/reconcileGeneratedVM/reconcileGeneratedVM';

import { type GeneratedVMDraft, type GenerationScope } from './types';

const useGeneratedVMDraft = ({
  cluster,
  creationMethod,
  project,
}: GenerationScope): GeneratedVMDraft => {
  const { getValues, setValue } = useVMWizardForm();
  const previousGeneratedRef = useRef<null | V1VirtualMachine>(null);
  const previousSourceRef = useRef<null | unknown>(null);
  const scopeRef = useRef({ cluster, creationMethod, project });

  useEffect(() => {
    if (!isEqual(scopeRef.current, { cluster, creationMethod, project })) {
      scopeRef.current = { cluster, creationMethod, project };

      previousGeneratedRef.current = null;
      previousSourceRef.current = null;
    }
  }, [cluster, creationMethod, project]);

  const isCurrentGeneratedDraft = useCallback(
    (source: unknown): boolean =>
      Boolean(
        getValues('customization.vmDraft') &&
        previousGeneratedRef.current &&
        isEqual(previousSourceRef.current, source),
      ),
    [getValues],
  );

  const publishGeneratedVM = useCallback(
    (generatedVM: V1VirtualMachine, source: unknown): void => {
      const customizedDraft = getValues('customization.vmDraft');
      const nextDraft =
        previousGeneratedRef.current && customizedDraft
          ? reconcileGeneratedVM(previousGeneratedRef.current, customizedDraft, generatedVM)
          : generatedVM;

      setValue('customization.autoLabelsApplied', false);
      setValue('customization.vmDraft', nextDraft, { shouldValidate: true });

      previousGeneratedRef.current = generatedVM;
      previousSourceRef.current = source;
    },
    [getValues, setValue],
  );

  return { isCurrentGeneratedDraft, publishGeneratedVM };
};

export default useGeneratedVMDraft;
