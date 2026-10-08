import { type FC } from 'react';
import produce from 'immer';
import { type TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getTolerations } from 'src/views/templates/utils/selectors';

import { type K8sIoApiCoreV1Toleration } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import TolerationsModal from '@kubevirt-utils/components/TolerationsModal/TolerationsModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';

const Tolerations: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const tolerationsCount = t('{{tolerations}} Toleration rules', {
    tolerations: getTolerations(template)?.length ?? 0,
  });

  const produceUpdatedTemplate = (tolerations: K8sIoApiCoreV1Toleration[]): Template =>
    produce(template, (draft) => {
      const draftVM = getTemplateVirtualMachineObject(draft);
      ensurePath(draftVM, 'spec.template.spec.tolerations');
      draftVM.spec.template.spec.tolerations = tolerations;
    });

  const onEditClick = (): void => {
    createModal?.(({ isOpen, onClose }) => (
      <TolerationsModal
        initialTolerationsProp={getTolerations(template)}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        produceUpdatedResource={produceUpdatedTemplate}
      />
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
