import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils/utils';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import DedicatedResourcesModal from './DedicatedResourcesModal';

const DedicatedResources: React.FC<TemplateSchedulingGridProps> = ({
  editable,
  onSubmit,
  template,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const dedicatedResourcesText = isDedicatedCPUPlacement(template)
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <DedicatedResourcesModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      descriptionData={dedicatedResourcesText}
      descriptionHeader={t('Dedicated resources')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default DedicatedResources;
