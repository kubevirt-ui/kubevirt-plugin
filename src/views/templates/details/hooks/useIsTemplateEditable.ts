import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';

import { isCommonVMTemplate } from '../../utils/utils';

/**
 * This hook checks the user capabilities of editing templates in a namespace.
 * Checks user permissions and template characteristics.
 * The hook does not check if the user has permissions for that particular template
 * as this behavior would compromise performarce in pages were a lot of templates are involved like template list.
 * @param template template to check
 * @returns boolean value
 */
const useEditTemplateAccessReview = (
  template: V1Template,
): {
  hasEditPermission: boolean;
  isCommonTemplate: boolean;
  isLoading: boolean;
  isTemplateEditable: boolean;
} => {
  const isCommonTemplate = isCommonVMTemplate(template);
  const [canUpdateTemplate, canUpdateLoading] = useAccessReview({
    namespace: template?.metadata?.namespace,
    resource: TemplateModel.plural,
    verb: 'update',
  });

  const [canPatchTemplate, canPatchLoading] = useAccessReview({
    namespace: template?.metadata?.namespace,
    resource: TemplateModel.plural,
    verb: 'patch',
  });

  const hasEditPermission = canUpdateTemplate && canPatchTemplate;

  if (!template || canUpdateLoading || canPatchLoading)
    return {
      hasEditPermission: false,
      isCommonTemplate,
      isLoading: true,
      isTemplateEditable: false,
    };

  return {
    hasEditPermission,
    isCommonTemplate,
    isLoading: canUpdateLoading || canPatchLoading,
    isTemplateEditable: !isCommonTemplate && hasEditPermission,
  };
};

export default useEditTemplateAccessReview;
