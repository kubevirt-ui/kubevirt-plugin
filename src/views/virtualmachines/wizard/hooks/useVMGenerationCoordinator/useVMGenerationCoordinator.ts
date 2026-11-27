import { useCallback } from 'react';
import { useWatch } from 'react-hook-form';

import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import useGenerateVM from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/useGenerateVM';

import { type VMGenerationCoordinator } from './types';
import useGeneratedVMDraft from './useGeneratedVMDraft';
import useTemplateVMGeneration from './useTemplateVMGeneration';

const useVMGenerationCoordinator = (): VMGenerationCoordinator => {
  const { autoLabelsLoading, control } = useVMWizardForm();
  const { defaultNadError, defaultNadName, generateVM, generationSource, ready } =
    useGenerateVM(autoLabelsLoading);
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
    if (defaultNadError) return false;
    if (isCurrentGeneratedDraft(generationSource)) return true;
    if (!ready) return false;

    publishGeneratedVM(generateVM(), generationSource);

    return true;
  }, [
    defaultNadError,
    generateVM,
    generationSource,
    isCurrentGeneratedDraft,
    publishGeneratedVM,
    ready,
  ]);

  return {
    defaultNadError,
    defaultNadName,
    ensureInstanceTypeDraft,
    ensureTemplateDraft,
    instanceTypeReady: !defaultNadError && (isCurrentGeneratedDraft(generationSource) || ready),
    isTemplateGenerating,
  };
};

export default useVMGenerationCoordinator;
