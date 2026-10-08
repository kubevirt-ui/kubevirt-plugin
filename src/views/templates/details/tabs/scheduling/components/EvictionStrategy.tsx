import type { FC } from 'react';
import { useCallback } from 'react';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import useTemplateVMSubmit from '@kubevirt-utils/resources/template/hooks/useTemplateVMSubmit';
import { getCluster } from '@multicluster/helpers/selectors';

import type { TemplateSchedulingGridDetailsProps } from '../types';

const EvictionStrategy: FC<TemplateSchedulingGridDetailsProps> = ({
  editable,
  onSubmit,
  template,
}) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const strategy = getEvictionStrategy(template) || t('No eviction strategy');
  const cluster = getCluster(template);

  const vm = getTemplateVirtualMachineObject(template);
  const onSubmitVM = useTemplateVMSubmit(template, onSubmit);

  const onEditClick = useCallback(
    () =>
      createModal?.(({ isOpen, onClose }) => (
        <EvictionStrategyModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitVM} vm={vm} />
      )),
    [createModal, onSubmitVM, vm],
  );

  return (
    <DescriptionItem
      descriptionData={<ShowEvictionStrategy cluster={cluster} evictionStrategy={strategy} />}
      descriptionHeader={t('Eviction strategy')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default EvictionStrategy;
