import React, { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import CategorySelect from '@kubevirt-utils/components/CategorySelect/CategorySelect';
import SelectProject from '@kubevirt-utils/components/CloneTemplateModal/SelectProject';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  FormGroup,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { isRunning } from '@virtualmachines/utils';

import useSaveAsTemplateModal from './useSaveAsTemplateModal';

type SaveAsTemplateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const SaveAsTemplateModal: FC<SaveAsTemplateModalProps> = ({ isOpen, onClose, vm }) => {
  const { t } = useKubevirtTranslation();

  const {
    category,
    onSubmit,
    selectedProject,
    setCategory,
    setSelectedProject,
    setTemplateName,
    templateName,
  } = useSaveAsTemplateModal(vm);

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Save as template')}
      isDisabled={!templateName.trim() || !selectedProject}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitBtnText={t('Save as template')}
      submitBtnVariant={ButtonVariant.primary}
    >
      {isRunning(vm) && (
        <Alert
          isInline
          title={t(
            'Creating a template from a running virtual machine might result in inconsistent data because the system is still writing changes. For best results, stop the VM before creating the template.',
          )}
          variant={AlertVariant.info}
        />
      )}

      <FormGroup fieldId="template-name" isRequired label={t('Name')}>
        <TextInput
          id="template-name"
          onChange={(_event, value: string) => setTemplateName(value)}
          type="text"
          value={templateName}
        />
      </FormGroup>

      <FormGroup fieldId="template-project" isRequired label={t('Project')}>
        <SelectProject
          cluster={getCluster(vm)}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      </FormGroup>

      <FormGroup fieldId="template-category-select" label={t('Category')}>
        <CategorySelect selectedCategory={category} setSelectedCategory={setCategory} />
      </FormGroup>
    </TabModal>
  );
};

export default SaveAsTemplateModal;
