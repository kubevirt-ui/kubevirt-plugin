import type { FC } from 'react';
import { useCallback } from 'react';
import produce from 'immer';
import type { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { EVICTION_STRATEGIES } from '@kubevirt-utils/components/EvictionStrategy/constants';
import EvictionStrategyModal from '@kubevirt-utils/components/EvictionStrategy/EvictionStrategyModal';
import ShowEvictionStrategy from '@kubevirt-utils/components/EvictionStrategy/ShowEvictionStrategy';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

const EvictionStrategy: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const strategy = getEvictionStrategy(template) || t('No eviction strategy');
  const cluster = getCluster(template);

  const produceUpdatedTemplate = useCallback(
    (isChecked: boolean): Template =>
      produce(template, (draft) => {
        const draftVM = getTemplateVirtualMachineObject(draft);
        ensurePath(draftVM, 'spec.template.spec');
        draftVM.spec.template.spec.evictionStrategy = isChecked
          ? EVICTION_STRATEGIES.LiveMigrate
          : EVICTION_STRATEGIES.None;
      }),
    [template],
  );

  const onEditClick = useCallback(
    () =>
      createModal(({ isOpen, onClose }) => (
        <EvictionStrategyModal
          evictionStrategy={getEvictionStrategy(template)}
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={onSubmit}
          produceUpdatedResource={produceUpdatedTemplate}
        />
      )),
    [createModal, onSubmit, produceUpdatedTemplate, template],
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
