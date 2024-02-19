import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import EvictionStrategyModal from './EvictionStrategyModal';

const EvictionStrategy: React.FC<TemplateSchedulingGridProps> = ({
  editable,
  onSubmit,
  template,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const strategy = getEvictionStrategy(template) || t('No eviction strategy');

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <EvictionStrategyModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      descriptionData={<ShowEvictionStrategy evictionStrategy={strategy} />}
      descriptionHeader={t('Eviction strategy')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default EvictionStrategy;
