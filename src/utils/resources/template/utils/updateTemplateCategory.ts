import { VirtualMachineTemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1VirtualMachineTemplate } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { escapeJsonPointerToken, isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

import { TEMPLATE_CATEGORY_LABEL } from './constants';
import { toTemplateCategoryLabelValue } from './getTemplateCategoryLabel';

type UpdateTemplateCategoryOptions = {
  category?: string;
  template: V1beta1VirtualMachineTemplate;
};

type GetTemplateCategoryPatchOptions = {
  categoryLabelValue?: string;
  currentLabels: Record<string, string>;
};

export const getTemplateCategoryPatch = ({
  categoryLabelValue,
  currentLabels,
}: GetTemplateCategoryPatchOptions): Patch[] => {
  const hasCategoryLabel = Object.prototype.hasOwnProperty.call(
    currentLabels,
    TEMPLATE_CATEGORY_LABEL,
  );
  const categoryPath = `/metadata/labels/${escapeJsonPointerToken(TEMPLATE_CATEGORY_LABEL)}`;

  if (!isEmpty(categoryLabelValue)) {
    return [
      {
        op: 'add',
        path: '/metadata/labels',
        value: {},
      },
      {
        op: 'add',
        path: categoryPath,
        value: categoryLabelValue,
      },
    ];
  }

  if (hasCategoryLabel) {
    return [
      {
        op: 'remove',
        path: categoryPath,
      },
    ];
  }

  return [];
};

export const updateTemplateCategory = ({
  category,
  template,
}: UpdateTemplateCategoryOptions): Promise<V1beta1VirtualMachineTemplate> => {
  const currentLabels = getLabels(template) ?? {};
  const categoryLabelValue = category ? toTemplateCategoryLabelValue(category) : undefined;
  const data = getTemplateCategoryPatch({ categoryLabelValue, currentLabels });

  if (isEmpty(data)) {
    return Promise.resolve(template);
  }

  return kubevirtK8sPatch({
    cluster: getCluster(template),
    data,
    model: VirtualMachineTemplateModel,
    resource: template,
  });
};
