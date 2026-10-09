import { type FC } from 'react';
import produce from 'immer';
import { type TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorDetailItem from '@kubevirt-utils/components/NodeSelectorDetailItem/NodeSelectorDetailItem';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import {
  idLabelsToNodeSelector,
  isEqualObject,
} from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { type IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { ensurePath } from '@kubevirt-utils/utils/utils';

const NodeSelector: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const produceTemplateWithNodeSelector = (selectorLabels: IDLabel[]): Template =>
    produce<Template>(template, (templateDraft: Template) => {
      const draftVM = getTemplateVirtualMachineObject(templateDraft);
      ensurePath(draftVM, ['spec.template.spec.nodeSelector']);

      const k8sSelector = idLabelsToNodeSelector(selectorLabels);

      if (!isEqualObject(getNodeSelector(templateDraft), k8sSelector)) {
        draftVM.spec.template.spec.nodeSelector = k8sSelector;
      }
    });

  const nodeSelector = getNodeSelector(template);

  const onEditClick = (): void => {
    createModal?.(({ isOpen, onClose }) => (
      <NodeSelectorModal
        isOpen={isOpen}
        nodeSelector={nodeSelector}
        onClose={onClose}
        onSubmit={onSubmit}
        produceUpdatedResource={produceTemplateWithNodeSelector}
      />
    ));
  };

  return (
    <DescriptionItem
      descriptionData={<NodeSelectorDetailItem nodeSelector={nodeSelector} />}
      descriptionHeader={t('Node selector')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default NodeSelector;
