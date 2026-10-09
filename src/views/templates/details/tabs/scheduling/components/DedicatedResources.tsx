import { type FC } from 'react';
import produce from 'immer';
import { type TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils/utils';

import DedicatedResourcesModal from '@kubevirt-utils/components/DedicatedResourcesModal/DedicatedResourcesModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';

const DedicatedResources: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const isDedicatedCPUPlacementTemplate = isDedicatedCPUPlacement(template);
  const dedicatedResourcesText = isDedicatedCPUPlacementTemplate
    ? t('Workload scheduled with dedicated resources (guaranteed policy)')
    : t('No dedicated resources applied');

  const produceUpdatedTemplate = (checked: boolean): Template =>
    produce(template, (draft) => {
      const draftVM = getTemplateVirtualMachineObject(draft);
      ensurePath(draftVM, ['spec.template.spec.domain.cpu']);
      draftVM.spec.template.spec.domain.cpu.dedicatedCpuPlacement = checked;
    });

  const onEditClick = (): void => {
    createModal?.(({ isOpen, onClose }) => (
      <DedicatedResourcesModal
        initialChecked={isDedicatedCPUPlacementTemplate}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        produceUpdatedResource={produceUpdatedTemplate}
      />
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
