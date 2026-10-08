import { type FC } from 'react';
import { getAffinity } from 'src/views/templates/utils/selectors';

import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import useTemplateVMSubmit from '@kubevirt-utils/resources/template/hooks/useTemplateVMSubmit';
import { getAffinityRules } from '@kubevirt-utils/resources/vmi';

import { type TemplateSchedulingGridDetailsProps } from '../types';

const AffinityRules: FC<TemplateSchedulingGridDetailsProps> = ({
  editable,
  onSubmit,
  template,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const rulesCount = t('{{rules}} Affinity rules', {
    rules: getAffinityRules(getAffinity(template))?.length ?? 0,
  });

  const vm = getTemplateVirtualMachineObject(template);
  const onSubmitVM = useTemplateVMSubmit(template, onSubmit);

  const onEditClick = (): void =>
    createModal?.(({ isOpen, onClose }) => (
      <AffinityModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitVM} vm={vm} />
    ));

  return (
    <DescriptionItem
      descriptionData={rulesCount}
      descriptionHeader={t('Affinity rules')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default AffinityRules;
