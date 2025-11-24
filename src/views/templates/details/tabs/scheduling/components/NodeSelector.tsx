import React, { FC } from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NodeSelectorDetailItem from '@kubevirt-utils/components/NodeSelectorDetailItem/NodeSelectorDetailItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import NodeSelectorModal from './NodeSelectorModal';

const NodeSelector: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <NodeSelectorModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        template={template}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={<NodeSelectorDetailItem nodeSelector={getNodeSelector(template)} />}
      descriptionHeader={t('Node selector')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default NodeSelector;
