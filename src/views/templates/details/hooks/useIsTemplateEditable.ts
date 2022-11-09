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
  isTemplateEditable: boolean;
  hasEditPermission: boolean;
  isCommonTemplate: boolean;
  isLoading: boolean;
} => {
  const isCommonTemplate = isCommonVMTemplate(template);
  const [canUpdateTemplate, canUpdateLoading] = useAccessReview({
    verb: 'update',
    resource: TemplateModel.plural,
    namespace: template?.metadata?.namespace,
  });

  const [canPatchTemplate, canPatchLoading] = useAccessReview({
    verb: 'patch',
    resource: TemplateModel.plural,
    namespace: template?.metadata?.namespace,
  });

  const hasEditPermission = canUpdateTemplate && canPatchTemplate;

  if (!template || canUpdateLoading || canPatchLoading)
    return {
      isTemplateEditable: false,
      hasEditPermission: false,
      isCommonTemplate,
      isLoading: true,
    };

  return {
    isTemplateEditable: !isCommonTemplate && hasEditPermission,
    hasEditPermission,
    isCommonTemplate,
    isLoading: canUpdateLoading || canPatchLoading,
  };
};

export default useEditTemplateAccessReview;
