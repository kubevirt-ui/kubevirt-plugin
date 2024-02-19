import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getAffinity } from 'src/views/templates/utils/selectors';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAffinityRules } from '@kubevirt-utils/resources/vmi';

import AffinityRulesModal from './AffinityRulesModal';

const AffinityRules: React.FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const rulesCount = t('{{rules}} Affinity rules', {
    rules: getAffinityRules(getAffinity(template))?.length ?? 0,
  });

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <AffinityRulesModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <VirtualMachineDescriptionItem
      descriptionData={rulesCount}
      descriptionHeader={t('Affinity rules')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default AffinityRules;
