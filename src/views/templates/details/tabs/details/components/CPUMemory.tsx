import React, { FC, useCallback } from 'react';
import { useVirtualMachineTemplatesCPUMemory } from 'src/views/templates/list/hooks/useVirtualMachineTemplatesCPUMemory';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TemplateModel, V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineCPU } from '@kubevirt-utils/resources/template';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

import CPUMemoryModal from './CPUMemoryModal';

type CPUMemoryProps = {
  editable: boolean;
  template: V1Template;
};

const CPUMemory: FC<CPUMemoryProps> = ({ editable, template }) => {
  const { t } = useKubevirtTranslation();
  const CPUMemData = useVirtualMachineTemplatesCPUMemory(template);
  const { createModal } = useModal();

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
    <VirtualMachineDescriptionItem
      bodyContent={
        <CPUDescription
          cpu={getTemplateVirtualMachineCPU(template)}
          helperTextResource={CpuMemHelperTextResources.Template}
        />
      }
      descriptionData={CPUMemData}
      descriptionHeader={t('CPU | Memory')}
      isEdit={editable}
      isPopover
      onEditClick={onEditClick}
    />
  );
};

export default CPUMemory;
