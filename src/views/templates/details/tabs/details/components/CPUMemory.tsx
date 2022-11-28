import * as React from 'react';
import { useVirtualMachineTemplatesCPUMemory } from 'src/views/templates/list/hooks/useVirtualMachineTemplatesCPUMemory';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

import CPUMemoryModal from './CPUMemoryModal';

type CPUMemoryProps = {
  template: V1Template;
};

const CPUMemory: React.FC<CPUMemoryProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const CPUMemData = useVirtualMachineTemplatesCPUMemory(template);
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const onSubmitCPU = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      }),
    [],
  );

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <CPUMemoryModal
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmitCPU}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('CPU | Memory')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Button
          type="button"
          isInline
          onClick={onEditClick}
          isDisabled={!isTemplateEditable}
          variant="link"
        >
          {CPUMemData}
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default CPUMemory;
