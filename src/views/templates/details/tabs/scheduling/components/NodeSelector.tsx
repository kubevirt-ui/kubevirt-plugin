import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Text,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import NodeSelectorModal from './NodeSelectorModal';

const NodeSelector: React.FC<TemplateSchedulingGridProps> = ({ template, editable, onSubmit }) => {
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
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Node selector')}</DescriptionListTerm>
      <DescriptionListDescription>
        {editable ? (
          <Button type="button" isInline onClick={onEditClick} variant="link">
            {nodeSelectorLabels}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <Text className="text-muted">{nodeSelectorLabels}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default NodeSelector;
