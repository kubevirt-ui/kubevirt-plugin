import { type FC } from 'react';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorDetailItem from '@kubevirt-utils/components/NodeSelectorDetailItem/NodeSelectorDetailItem';
import NodeSelectorModal from '@kubevirt-utils/components/NodeSelectorModal/NodeSelectorModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import useTemplateVMSubmit from '@kubevirt-utils/resources/template/hooks/useTemplateVMSubmit';

import { type TemplateSchedulingGridDetailsProps } from '../types';

const NodeSelector: FC<TemplateSchedulingGridDetailsProps> = ({ editable, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const nodeSelector = getNodeSelector(template);
  const vm = getTemplateVirtualMachineObject(template);
  const onSubmitVM = useTemplateVMSubmit(template, onSubmit);

  const onEditClick = (): void => {
    createModal?.(({ isOpen, onClose }) => (
      <NodeSelectorModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmitVM} vm={vm} />
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
