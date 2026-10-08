import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';
import { type VMGenerationSource } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/getVMGenerationSource';

import { type TemplateGeneratedDraftSource } from './utils/getTemplateGenerationSource';

export type GeneratedDraftSource = VMGenerationSource | TemplateGeneratedDraftSource;

export type GenerationScope = {
  cluster: string;
  creationMethod: VMWizardFormValues['creationMethod'];
  project: string;
};

export type GeneratedVMDraft = {
  isCurrentGeneratedDraft: (source: GeneratedDraftSource) => boolean;
  publishGeneratedVM: (generatedVM: V1VirtualMachine, source: GeneratedDraftSource) => void;
};

export type TemplateVMGeneration = {
  ensureTemplateDraft: () => Promise<boolean>;
  isTemplateGenerating: boolean;
};

export type VMGenerationCoordinator = {
  ensureInstanceTypeDraft: () => boolean;
  ensureTemplateDraft: () => Promise<boolean>;
  instanceTypeReady: boolean;
  isTemplateGenerating: boolean;
};
