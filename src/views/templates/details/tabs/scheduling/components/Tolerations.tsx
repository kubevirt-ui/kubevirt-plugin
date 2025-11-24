import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getTolerations } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import TolerationsModal from './TolerationsModal';

const Tolerations: React.FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const tolerationsCount = t('{{tolerations}} Toleration rules', {
    tolerations: getTolerations(template)?.length ?? 0,
  });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <TolerationsModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} template={template} />
    ));

  return (
    <DescriptionItem
      descriptionData={tolerationsCount}
      descriptionHeader={t('Tolerations')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default Tolerations;
