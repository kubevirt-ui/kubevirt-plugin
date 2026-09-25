import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';

export type GenerationScope = {
  cluster: string;
  creationMethod: VMWizardFormValues['creationMethod'];
  project: string;
};

export type GeneratedVMDraft = {
  isCurrentGeneratedDraft: (source: unknown) => boolean;
  publishGeneratedVM: (generatedVM: V1VirtualMachine, source: unknown) => void;
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
