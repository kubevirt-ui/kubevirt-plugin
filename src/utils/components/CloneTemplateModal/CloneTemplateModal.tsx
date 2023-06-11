import * as React from 'react';
import produce from 'immer';
import { LABELS } from 'src/views/templates/utils/constants';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ANNOTATIONS,
  APP_NAME_LABEL,
  CUSTOM_TEMPLATES,
  getTemplateVirtualMachineObject,
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
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
          [ANNOTATIONS.displayName]: templateDisplayName,
          [ANNOTATIONS.providerDisplayName]: templateProvider,
          [LABELS.provider]: templateProvider,
        },
        labels: {
          ...draftTemplate?.metadata?.labels,
          [APP_NAME_LABEL]: CUSTOM_TEMPLATES,
          [LABELS.name]: obj?.metadata?.name,
          [LABELS.namespace]: obj?.metadata?.namespace,
          [LABELS.type]: TEMPLATE_TYPE_VM,
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
      data: templateToCreate,
      model: TemplateModel,
    });

    if (onTemplateCloned) onTemplateCloned(clonedTemplate);
  };

  return (
    <>
      <TabModal<K8sResourceCommon>
        headerText={t('Clone template')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={onSubmit}
        submitBtnText={t('Clone')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Form className="clone-template-modal">
          <FormGroup fieldId="name" isRequired label={t('Template name')}>
            <TextInput id="name" onChange={setTemplateName} type="text" value={templateName} />
          </FormGroup>

          <FormGroup
            fieldId="namespace"
            helperText={t('Project name to clone the template to')}
            label={t('Template project')}
          >
            <SelectProject
              id="namespace"
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
            />
          </FormGroup>
          <FormGroup fieldId="display-name" label={t('Template display name')}>
            <TextInput
              id="display-name"
              onChange={setTemplateDisplayName}
              type="text"
              value={templateDisplayName}
            />
          </FormGroup>

          <FormGroup
            fieldId="provider"
            helperText={t('Example: your company name')}
            label={t('Template provider')}
          >
            <TextInput
              id="provider"
              onChange={setTemplateProvider}
              type="text"
              value={templateProvider}
            />
          </FormGroup>
          {clonableStorage && (
            <CloneStorageCheckbox isChecked={isCloneStorageEnabled} onChange={setCloneStorage} />
          )}
          {isCloneStorageEnabled && (
            <FormGroup
              className="pvc-name-form-group"
              fieldId="pvc-name"
              isRequired
              label={t('Name of the template new disk')}
            >
              <TextInput id="pvc-name" onChange={setPVCName} type="text" value={pvcName} />
            </FormGroup>
          )}
        </Form>
      </TabModal>
    </>
  );
};

export default CloneTemplateModal;
