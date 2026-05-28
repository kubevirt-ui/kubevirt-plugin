import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  isOpenShiftTemplate,
  isVirtualMachineTemplate,
  Template,
} from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';

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
  template: Template,
): {
  hasEditPermission: boolean;
  isCommonTemplate: boolean;
  isLoading: boolean;
  isTemplateEditable: boolean;
} => {
  const isCommonTemplate = isOpenShiftTemplate(template) && isCommonVMTemplate(template);
  const [canUpdateTemplate, canUpdateLoading] = useFleetAccessReview({
    cluster: getCluster(template),
    group: TemplateModel.apiGroup,
    namespace: template?.metadata?.namespace,
    resource: TemplateModel.plural,
    verb: 'update',
  });

  const [canPatchTemplate, canPatchLoading] = useFleetAccessReview({
    cluster: getCluster(template),
    group: TemplateModel.apiGroup,
    namespace: template?.metadata?.namespace,
    resource: TemplateModel.plural,
    verb: 'patch',
  });

  const hasEditPermission = canUpdateTemplate && canPatchTemplate;

  // VMT editing not yet supported — always read-only
  if (isVirtualMachineTemplate(template))
    return {
      hasEditPermission: false,
      isCommonTemplate: false,
      isLoading: false,
      isTemplateEditable: false,
    };

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
