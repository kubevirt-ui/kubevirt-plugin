import { type FC } from 'react';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils/utils';

import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import useTemplateVMSubmit from '@kubevirt-utils/resources/template/hooks/useTemplateVMSubmit';

import { type TemplateSchedulingGridDetailsProps } from '../types';

const DedicatedResources: FC<TemplateSchedulingGridDetailsProps> = ({
  editable,
  onSubmit,
  template,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const isDedicatedCPUPlacementTemplate = isDedicatedCPUPlacement(template);
  const dedicatedResourcesText = isDedicatedCPUPlacementTemplate
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');

  const vm = getTemplateVirtualMachineObject(template);
  const onSubmitVM = useTemplateVMSubmit(template, onSubmit);

  const onEditClick = (): void => {
    createModal?.(({ isOpen, onClose }) => (
      <DedicatedResourcesModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitVM} vm={vm} />
    ));
  };

  return (
    <DescriptionItem
      descriptionData={dedicatedResourcesText}
      descriptionHeader={t('Dedicated resources')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default DedicatedResources;
