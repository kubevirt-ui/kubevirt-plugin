import { type FC } from 'react';
import { getTolerations } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import useTemplateVMSubmit from '@kubevirt-utils/resources/template/hooks/useTemplateVMSubmit';

import { type TemplateSchedulingGridDetailsProps } from '../types';

const Tolerations: FC<TemplateSchedulingGridDetailsProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const tolerationsCount = t('{{tolerations}} Toleration rules', {
    tolerations: getTolerations(template)?.length ?? 0,
  });

  const vm = getTemplateVirtualMachineObject(template);
  const onSubmitVM = useTemplateVMSubmit(template, onSubmit);

  const onEditClick = (): void => {
    createModal?.(({ isOpen, onClose }) => (
      <TolerationsModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitVM} vm={vm} />
    ));
  };

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
