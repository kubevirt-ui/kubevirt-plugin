import React, { FC, useCallback } from 'react';
import { useVirtualMachineTemplatesCPUMemory } from 'src/views/templates/list/hooks/useVirtualMachineTemplatesCPUMemory';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

import CPUMemoryModal from './CPUMemoryModal';

type CPUMemoryProps = {
  template: V1Template;
};

const CPUMemory: FC<CPUMemoryProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const CPUMemData = useVirtualMachineTemplatesCPUMemory(template);
  const { createModal } = useModal();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const onSubmitCPU = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <CPUMemoryModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmitCPU}
        template={template}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <CPUDescription
              cpu={getTemplateVirtualMachineObject(template)?.spec?.template?.spec?.domain?.cpu}
              helperTextResource={CpuMemHelperTextResources.Template}
            />
          }
          hasAutoWidth
          headerContent={t('CPU | Memory')}
          maxWidth="30rem"
        >
          <DescriptionListTermHelpTextButton>{t('CPU | Memory')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>
      <DescriptionListDescription>
        <Button
          isDisabled={!isTemplateEditable}
          isInline
          onClick={onEditClick}
          type="button"
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
