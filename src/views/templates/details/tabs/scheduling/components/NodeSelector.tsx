import React, { FC } from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, LabelGroup } from '@patternfly/react-core';

import NodeSelectorModal from './NodeSelectorModal';

const NodeSelector: FC<TemplateSchedulingGridProps> = ({ editable, onSubmit, template }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const nodeSelector = getNodeSelector(template);
  const nodeSelectorLabels = !isEmpty(nodeSelector) ? (
    <LabelGroup defaultIsOpen>
      {Object.entries(nodeSelector)?.map(([key, value]) => (
        <Label key={key}>{`${key}=${value}`}</Label>
      ))}
    </LabelGroup>
  ) : (
    t('No selector')
  );

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
    <VirtualMachineDescriptionItem
      descriptionData={nodeSelectorLabels}
      descriptionHeader={t('Node selector')}
      isEdit={editable}
      onEditClick={onEditClick}
    />
  );
};

export default NodeSelector;
