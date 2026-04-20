import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SelectProject from '@kubevirt-utils/components/CloneTemplateModal/SelectProject';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
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

  const { onSubmit, selectedProject, setSelectedProject, setTemplateName, templateName } =
    useSaveAsTemplateModal(vm);

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
          title={t(
            'Creating a template from a running virtual machine might result in inconsistent data because the system is still writing changes. For best results, stop the VM before creating the template.',
          )}
          isInline
          variant={AlertVariant.info}
        />
      )}

      <FormGroup fieldId="template-name" isRequired label={t('Name')}>
        <TextInput
          id="template-name"
          onChange={(_, value: string) => setTemplateName(value)}
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
    </TabModal>
  );
};

export default SaveAsTemplateModal;
