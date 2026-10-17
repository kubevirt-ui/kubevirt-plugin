import { sceneRunningVirtualMachine } from '../stories/story-vm-detail-fixtures';

type TemplateGenerationArgs = {
  publishGeneratedVM?: (generatedVM: unknown, source: unknown) => void;
};

/** Gallery: publish a minimal VM draft so template flows can reach customization/review. */
const useTemplateVMGeneration = ({ publishGeneratedVM }: TemplateGenerationArgs) => ({
  ensureTemplateDraft: async () => {
    publishGeneratedVM?.(sceneRunningVirtualMachine, { kind: 'gallery-template-draft' });
    return true;
  },
  isTemplateGenerating: false,
});

export default useTemplateVMGeneration;
