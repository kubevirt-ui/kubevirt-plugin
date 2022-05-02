import * as React from 'react';
import produce from 'immer';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TEMPLATE_TYPE_VM } from '@kubevirt-utils/resources/template';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Checkbox, Form, FormGroup, TextInput } from '@patternfly/react-core';

import SelectProject from './SelectProject';
import { cloneStorage, getTemplateVMPVC } from './utils';

type CloneTemplateModalProps = {
  isOpen: boolean;
  obj: V1Template;
  onClose: () => void;
};

const CloneTemplateModal: React.FC<CloneTemplateModalProps> = ({ isOpen, obj, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [templateName, setTemplateName] = React.useState(
    `${obj?.metadata?.name}-${getRandomChars(9)}`,
  );
  const templateVMPVC = getTemplateVMPVC(obj);
  const clonableStorage = !!templateVMPVC;
  const [pvcName, setPVCName] = React.useState(`${templateVMPVC?.name}-clone`);
  const [templateProvider, setTemplateProvider] = React.useState('');
  const [selectedProject, setSelectedProject] = React.useState(obj?.metadata?.namespace);
  const [selectedPVCProject, setSelectedPVCProject] = React.useState(obj?.metadata?.namespace);
  const [isCloneStorageEnabled, setCloneStorage] = React.useState(false);

  const onSubmit = async () => {
    let templateToCreate: V1Template = {
      ...obj,
      metadata: {
        annotations: {
          ...obj?.metadata?.annotations,
          'template.kubevirt.io/provider': templateProvider,
        },
        labels: { ...obj?.metadata?.labels, 'template.kubevirt.io/type': TEMPLATE_TYPE_VM },
        name: templateName,
        namespace: selectedProject,
      },
    };

    if (isCloneStorageEnabled) {
      await cloneStorage(obj, pvcName, selectedPVCProject);

      templateToCreate = produce(templateToCreate, (draftTemplate) => {
        draftTemplate.objects[0].spec.dataVolumeTemplates[0].spec.source.pvc.name = pvcName;
        draftTemplate.objects[0].spec.dataVolumeTemplates[0].spec.source.pvc.namespace =
          selectedPVCProject;
      });
    }

    await k8sCreate<V1Template>({
      model: TemplateModel,
      data: templateToCreate,
    });
  };

  return (
    <>
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={t('Clone Template')}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Form>
          <FormGroup label={t('Template name')} fieldId="name" isRequired>
            <TextInput id="name" type="text" value={templateName} onChange={setTemplateName} />
          </FormGroup>

          <FormGroup
            label={t('Template provider')}
            fieldId="provider"
            isRequired
            helperText={t('Example: your company name')}
          >
            <TextInput
              id="provider"
              type="text"
              value={templateProvider}
              onChange={setTemplateProvider}
            />
          </FormGroup>
          <FormGroup label={t('Template namespace')} fieldId="namespace" isRequired>
            <SelectProject
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              id="namespace"
            />
          </FormGroup>
          {clonableStorage && (
            <FormGroup fieldId="clone-storage">
              <Checkbox
                id="clone-storage"
                isChecked={isCloneStorageEnabled}
                onChange={setCloneStorage}
                label={t('Clone storage')}
              />
            </FormGroup>
          )}
          {isCloneStorageEnabled && (
            <FormGroup label={t('PVC name')} fieldId="pvc-name" isRequired>
              <TextInput id="pvc-name" type="text" value={pvcName} onChange={setPVCName} />
            </FormGroup>
          )}
          {isCloneStorageEnabled && (
            <FormGroup label={t('PVC namespace')} fieldId="pvc-namespace" isRequired>
              <SelectProject
                selectedProject={selectedPVCProject}
                setSelectedProject={setSelectedPVCProject}
                id="pvc-namespace"
              />
            </FormGroup>
          )}
        </Form>
      </TabModal>
    </>
  );
};

export default CloneTemplateModal;
