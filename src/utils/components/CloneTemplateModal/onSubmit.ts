import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getAnnotations, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  ANNOTATIONS,
  APP_NAME_LABEL,
  CUSTOM_TEMPLATES,
  getTemplateVirtualMachineObject,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  TEMPLATE_DEFAULT_VARIANT_LABEL,
  TEMPLATE_TYPE_VM,
  TEMPLATE_VERSION_LABEL,
} from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { LABELS } from '@templates/utils/constants';

import { CloneTemplateFormValues } from './form/types';
import { cloneStorage } from './utils';

type CloneTemplateSubmitParams = {
  formValues: CloneTemplateFormValues;
  onTemplateCloned?: (clonedTemplate: V1Template) => void;
};

export const cloneTemplateSubmit = async ({
  formValues,
  onTemplateCloned,
}: CloneTemplateSubmitParams): Promise<void> => {
  const {
    isCloneStorageEnabled,
    pvcName,
    targetProject: templateNamespace,
    template,
    templateDisplayName,
    templateName,
    templateProvider,
  } = formValues;

  let templateToCreate: V1Template = produce(template as V1Template, (draftTemplate) => {
    draftTemplate.metadata = {
      annotations: {
        ...getAnnotations(draftTemplate),
        [ANNOTATIONS.displayName]: templateDisplayName,
        [ANNOTATIONS.providerDisplayName]: templateProvider,
        [LABELS.provider]: templateProvider,
      },
      labels: {
        ...getLabels(draftTemplate),
        [APP_NAME_LABEL]: CUSTOM_TEMPLATES,
        [LABELS.name]: getName(template),
        [LABELS.namespace]: getNamespace(template),
        [LABELS.type]: TEMPLATE_TYPE_VM,
      },
      name: templateName,
      namespace: templateNamespace,
    };

    const draftVM = getTemplateVirtualMachineObject(draftTemplate);
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = templateName;
    draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = templateNamespace;
    delete draftVM.metadata.labels[TEMPLATE_VERSION_LABEL];
    delete draftTemplate.metadata.labels[TEMPLATE_DEFAULT_VARIANT_LABEL];
  });

  if (isCloneStorageEnabled) {
    await cloneStorage(template as V1Template, pvcName, templateNamespace);

    templateToCreate = produce(templateToCreate, (draftTemplate) => {
      const draftVM = getTemplateVirtualMachineObject(draftTemplate);
      delete draftVM.spec.dataVolumeTemplates[0].spec.sourceRef;
      draftVM.spec.dataVolumeTemplates[0].spec.source.pvc.name = pvcName;
      draftVM.spec.dataVolumeTemplates[0].spec.source.pvc.namespace = templateNamespace;
    });
  }

  const clonedTemplate = await kubevirtK8sCreate<V1Template>({
    cluster: getCluster(template),
    data: templateToCreate,
    model: TemplateModel,
  });

  if (onTemplateCloned) onTemplateCloned(clonedTemplate);
};
