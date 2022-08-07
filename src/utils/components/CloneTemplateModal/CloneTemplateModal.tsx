import * as React from 'react';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ANNOTATIONS,
  CUSTOM_TEMPLATES,
  getTemplateVirtualMachineObject,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
  TEMPLATE_APP_NAME_LABEL,
  TEMPLATE_TYPE_VM,
  TEMPLATE_VERSION_LABEL,
} from '@kubevirt-utils/resources/template';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Form, FormGroup, TextInput } from '@patternfly/react-core';

import CloneStorageCheckbox from './CloneStorageCheckbox';
import SelectProject from './SelectProject';
import { cloneStorage, getTemplateBootSourcePVC } from './utils';

import './clone-template-modal.scss';

type CloneTemplateModalProps = {
  isOpen: boolean;
  obj: V1Template;
  onClose: () => void;
  onTemplateCloned?: (clonedTemplate: V1Template) => void;
};

const CloneTemplateModal: React.FC<CloneTemplateModalProps> = ({
  isOpen,
  obj,
  onClose,
  onTemplateCloned,
}) => {
  const { t } = useKubevirtTranslation();
  const [templateName, setTemplateName] = React.useState(
    `${obj?.metadata?.name}-${getRandomChars(9)}`,
  );
  const templateVMPVC = getTemplateBootSourcePVC(obj);
  const clonableStorage = !!templateVMPVC;
  const [pvcName, setPVCName] = React.useState(`${templateVMPVC?.name}-clone`);
  const [templateProvider, setTemplateProvider] = React.useState('');
  const [selectedProject, setSelectedProject] = React.useState(obj?.metadata?.namespace);
  const [isCloneStorageEnabled, setCloneStorage] = React.useState(false);
  const [templateDisplayName, setTemplateDisplayName] = React.useState(
    obj?.metadata?.annotations?.[ANNOTATIONS.displayName] || '',
  );
  const onSubmit = async () => {
    let templateToCreate: V1Template = produce(obj, (draftTemplate) => {
      const draftVM = getTemplateVirtualMachineObject(draftTemplate);
      draftTemplate.metadata = {
        annotations: {
          ...draftTemplate?.metadata?.annotations,
          'template.kubevirt.io/provider': templateProvider,
          [ANNOTATIONS.providerDisplayName]: templateProvider,
          [ANNOTATIONS.displayName]: templateDisplayName,
        },
        labels: {
          ...draftTemplate?.metadata?.labels,
          'template.kubevirt.io/type': TEMPLATE_TYPE_VM,
          [TEMPLATE_APP_NAME_LABEL]: CUSTOM_TEMPLATES,
        },
        name: templateName,
        namespace: selectedProject,
      };

      draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = templateName;
      draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = selectedProject;
      delete draftVM.metadata.labels[TEMPLATE_VERSION_LABEL];
    });

    if (isCloneStorageEnabled) {
      await cloneStorage(obj, pvcName, selectedProject);

      templateToCreate = produce(templateToCreate, (draftTemplate) => {
        const draftVM = getTemplateVirtualMachineObject(draftTemplate);
        delete draftVM.spec.dataVolumeTemplates[0].spec.sourceRef;
        draftVM.spec.dataVolumeTemplates[0].spec.source.pvc.name = pvcName;
        draftVM.spec.dataVolumeTemplates[0].spec.source.pvc.namespace = selectedProject;
      });
    }
    const clonedTemplate = await k8sCreate<V1Template>({
      model: TemplateModel,
      data: templateToCreate,
    });

    if (onTemplateCloned) onTemplateCloned(clonedTemplate);
  };

  return (
    <>
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={t('Clone template')}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
        submitBtnText={t('Clone')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Form className="clone-template-modal">
          <FormGroup label={t('Template name')} fieldId="name" isRequired>
            <TextInput id="name" type="text" value={templateName} onChange={setTemplateName} />
          </FormGroup>

          <FormGroup
            label={t('Template project')}
            fieldId="namespace"
            helperText={t('Project name to clone the template to')}
          >
            <SelectProject
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              id="namespace"
            />
          </FormGroup>
          <FormGroup label={t('Template display name')} fieldId="display-name">
            <TextInput
              id="display-name"
              type="text"
              value={templateDisplayName}
              onChange={setTemplateDisplayName}
            />
          </FormGroup>

          <FormGroup
            label={t('Template provider')}
            fieldId="provider"
            helperText={t('Example: your company name')}
          >
            <TextInput
              id="provider"
              type="text"
              value={templateProvider}
              onChange={setTemplateProvider}
            />
          </FormGroup>
          {clonableStorage && (
            <CloneStorageCheckbox isChecked={isCloneStorageEnabled} onChange={setCloneStorage} />
          )}
          {isCloneStorageEnabled && (
            <FormGroup
              label={t('Name of the template new disk')}
              fieldId="pvc-name"
              className="pvc-name-form-group"
              isRequired
            >
              <TextInput id="pvc-name" type="text" value={pvcName} onChange={setPVCName} />
            </FormGroup>
          )}
        </Form>
      </TabModal>
    </>
  );
};

export default CloneTemplateModal;
