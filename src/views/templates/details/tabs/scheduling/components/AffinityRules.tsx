import { type FC } from 'react';
import produce from 'immer';
import { type TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getAffinity } from 'src/views/templates/utils/selectors';

import { type K8sIoApiCoreV1Affinity } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import AffinityModal from '@kubevirt-utils/components/AffinityModal/AffinityModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { getAffinityRules } from '@kubevirt-utils/resources/vmi';
import { ensurePath } from '@kubevirt-utils/utils/utils';

const AffinityRules: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const rulesCount = t('{{rules}} Affinity rules', {
    rules: getAffinityRules(getAffinity(template))?.length ?? 0,
  });

  const produceUpdatedTemplate = (affinity: K8sIoApiCoreV1Affinity): Template =>
    produce(template, (draft) => {
      const draftVM = getTemplateVirtualMachineObject(draft);
      ensurePath(draftVM, 'spec.template.spec.affinity');
      draftVM.spec.template.spec.affinity = affinity;
    });

  const onEditClick = (): void =>
    createModal?.(({ isOpen, onClose }) => (
      <AffinityModal
        initialAffinity={getAffinity(template)}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        produceUpdatedResource={produceUpdatedTemplate}
      />
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
