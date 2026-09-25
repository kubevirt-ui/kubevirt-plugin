import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useGenerateVM from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/useGenerateVM';

import { type VMGenerationCoordinator } from './types';
import useGeneratedVMDraft from './useGeneratedVMDraft';
import useTemplateVMGeneration from './useTemplateVMGeneration';

const useVMGenerationCoordinator = (): VMGenerationCoordinator => {
  const { autoLabelsLoading, control } = useVMWizardForm();
  const { generateVM, generationSource, ready } = useGenerateVM(autoLabelsLoading);
  const [creationMethod, cluster, project] = useWatch({
    control,
    name: ['creationMethod', 'deployment.cluster', 'deployment.project', 'customization.vmDraft'],
  });

  const generatedVMDraft = useGeneratedVMDraft({ cluster, creationMethod, project });
  const { isCurrentGeneratedDraft, publishGeneratedVM } = generatedVMDraft;
  const { ensureTemplateDraft, isTemplateGenerating } = useTemplateVMGeneration({
    ...generatedVMDraft,
    cluster,
    creationMethod,
    project,
  });

  const ensureInstanceTypeDraft = useCallback((): boolean => {
    if (isCurrentGeneratedDraft(generationSource)) return true;
    if (!ready) return false;

    publishGeneratedVM(generateVM(), generationSource);

    return true;
  }, [generateVM, generationSource, isCurrentGeneratedDraft, publishGeneratedVM, ready]);

  return {
    ensureInstanceTypeDraft,
    ensureTemplateDraft,
    instanceTypeReady: isCurrentGeneratedDraft(generationSource) || ready,
    isTemplateGenerating,
  };
};

export default useVMGenerationCoordinator;
